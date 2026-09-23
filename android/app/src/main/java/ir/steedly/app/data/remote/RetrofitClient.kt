package ir.steedly.app.data.remote

import ir.steedly.app.BuildConfig
import ir.steedly.app.data.local.TokenManager
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    /** e.g. http://10.0.2.2:3000/api/ — configured per build type in build.gradle.kts */
    val BASE_URL: String = BuildConfig.API_BASE_URL

    /** Server root, used to resolve relative upload paths such as /uploads/images/x.jpg */
    val SERVER_ROOT: String = BASE_URL.removeSuffix("/").removeSuffix("/api")

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

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val apiService: ApiService = retrofit.create(ApiService::class.java)

    /** Turns a relative path returned by the API into an absolute URL Coil can load. */
    fun resolveUrl(path: String?): String? {
        if (path.isNullOrBlank()) return null
        if (path.startsWith("http://") || path.startsWith("https://")) return path
        return SERVER_ROOT + (if (path.startsWith("/")) path else "/$path")
    }
}
