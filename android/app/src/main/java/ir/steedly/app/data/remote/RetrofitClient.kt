package ir.steedly.app.data.remote

import ir.steedly.app.BuildConfig
import ir.steedly.app.data.local.TokenManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    /** Build-time default, e.g. http://10.0.2.2:3000/api/ (see build.gradle.kts). */
    val DEFAULT_BASE_URL: String = BuildConfig.API_BASE_URL

    /** Current API base URL; debug builds can change it from Settings. */
    @Volatile
    var baseUrl: String = DEFAULT_BASE_URL
        private set

    /** Server root, used to resolve relative upload paths such as /uploads/images/x.jpg */
    val SERVER_ROOT: String get() = serverRoot(baseUrl)

    private fun serverRoot(apiUrl: String) = apiUrl.removeSuffix("/").removeSuffix("/api")

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BODY else HttpLoggingInterceptor.Level.NONE
    }

    private val authInterceptor = Interceptor { chain ->
        val originalRequest = chain.request()
        val token = TokenManager.getToken()

        val request = if (token != null) {
            originalRequest.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            originalRequest
        }

        val response = chain.proceed(request)
        // Expired or revoked session: drop it so the UI falls back to the login flow
        if (response.code == 401 && token != null) {
            TokenManager.onUnauthorized()
        }
        response
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    private fun createService(url: String): ApiService =
        Retrofit.Builder()
            .baseUrl(url)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)

    @Volatile
    private var service: ApiService = createService(DEFAULT_BASE_URL)

    val apiService: ApiService get() = service

    /** Points every subsequent request at [url] (already normalised with [normalizeBaseUrl]). */
    fun setBaseUrl(url: String) {
        if (url == baseUrl) return
        service = createService(url)
        baseUrl = url
    }

    /**
     * Turns user input such as "192.168.1.10:3000" into "http://192.168.1.10:3000/api/".
     * Returns null when the input is not a usable URL.
     */
    fun normalizeBaseUrl(input: String): String? {
        var text = input.trim()
        if (text.isEmpty()) return null
        if (!text.startsWith("http://") && !text.startsWith("https://")) text = "http://$text"
        val parsed = text.toHttpUrlOrNull() ?: return null
        val segments = parsed.pathSegments.filter { it.isNotEmpty() }
        val builder = parsed.newBuilder().encodedPath("/")
        segments.forEach { builder.addPathSegment(it) }
        if (segments.lastOrNull() != "api") builder.addPathSegment("api")
        return builder.build().toString().removeSuffix("/") + "/"
    }

    /** Calls the backend's /health endpoint; true when the server answers 2xx. */
    suspend fun checkHealth(apiUrl: String): Boolean = withContext(Dispatchers.IO) {
        val probe = OkHttpClient.Builder()
            .connectTimeout(5, TimeUnit.SECONDS)
            .readTimeout(5, TimeUnit.SECONDS)
            .build()
        try {
            probe.newCall(Request.Builder().url(serverRoot(apiUrl) + "/health").build())
                .execute()
                .use { it.isSuccessful }
        } catch (e: Exception) {
            false
        }
    }

    /** Turns a relative path returned by the API into an absolute URL Coil can load. */
    fun resolveUrl(path: String?): String? {
        if (path.isNullOrBlank()) return null
        if (path.startsWith("http://") || path.startsWith("https://")) return path
        return SERVER_ROOT + (if (path.startsWith("/")) path else "/$path")
    }
}
