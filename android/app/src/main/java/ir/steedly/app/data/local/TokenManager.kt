package ir.steedly.app.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "steedly_prefs")

/**
 * Stores the JWT. The token is mirrored in memory so the OkHttp interceptor
 * never has to block on DataStore for every request.
 */
object TokenManager {
    private val TOKEN_KEY = stringPreferencesKey("auth_token")
    private val USER_ID_KEY = stringPreferencesKey("user_id")

    private var context: Context? = null

    private val _token = MutableStateFlow<String?>(null)
    val token: StateFlow<String?> = _token.asStateFlow()

    val isLoggedIn: Boolean get() = _token.value != null

    fun init(context: Context) {
        if (this.context != null) return
        this.context = context.applicationContext
        // One-off blocking read at startup so the first requests are authenticated
        _token.value = runBlocking {
            try {
                context.applicationContext.dataStore.data.first()[TOKEN_KEY]
            } catch (e: Exception) {
                null
            }
        }
    }

    suspend fun saveSession(token: String, userId: Int?) {
        _token.value = token
        context?.dataStore?.edit { preferences ->
            preferences[TOKEN_KEY] = token
            if (userId != null) preferences[USER_ID_KEY] = userId.toString()
        }
    }

    fun getToken(): String? = _token.value

    suspend fun clearToken() {
        _token.value = null
        context?.dataStore?.edit { preferences ->
            preferences.remove(TOKEN_KEY)
            preferences.remove(USER_ID_KEY)
        }
    }

    /** Called from the network layer when the server rejects the token. */
    fun onUnauthorized() {
        _token.value = null
        context?.let { ctx ->
            runBlocking {
                ctx.dataStore.edit { preferences ->
                    preferences.remove(TOKEN_KEY)
                    preferences.remove(USER_ID_KEY)
                }
            }
        }
    }
}
