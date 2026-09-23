package ir.steedly.app.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map

private val Context.settingsDataStore: DataStore<Preferences> by preferencesDataStore(name = "steedly_settings")

object SettingsManager {
    private val DARK_MODE_KEY = booleanPreferencesKey("dark_mode")
    private val DARK_MODE_AUTO_KEY = booleanPreferencesKey("dark_mode_auto")
    private val OFFLINE_MODE_KEY = booleanPreferencesKey("offline_mode")
    private val NOTIFICATIONS_KEY = booleanPreferencesKey("notifications_enabled")
    private val LAST_NOTIFIED_ID_KEY = intPreferencesKey("last_notified_id")
    private val SERVER_URL_KEY = stringPreferencesKey("server_url")

    private var context: Context? = null

    fun init(context: Context) {
        this.context = context.applicationContext
    }

    private fun <T> read(key: Preferences.Key<T>, default: T): Flow<T> =
        context?.settingsDataStore?.data?.map { it[key] ?: default } ?: flowOf(default)

    private suspend fun <T> write(key: Preferences.Key<T>, value: T) {
        context?.settingsDataStore?.edit { it[key] = value }
    }

    // Dark mode
    suspend fun setDarkMode(enabled: Boolean) = write(DARK_MODE_KEY, enabled)
    fun getDarkMode(): Flow<Boolean> = read(DARK_MODE_KEY, false)

    suspend fun setDarkModeAuto(enabled: Boolean) = write(DARK_MODE_AUTO_KEY, enabled)
    fun getDarkModeAuto(): Flow<Boolean> = read(DARK_MODE_AUTO_KEY, true)

    // Offline mode: when on, fetched content is stored for later offline use
    suspend fun setOfflineMode(enabled: Boolean) = write(OFFLINE_MODE_KEY, enabled)
    fun getOfflineMode(): Flow<Boolean> = read(OFFLINE_MODE_KEY, true)
    suspend fun isOfflineModeEnabled(): Boolean = getOfflineMode().first()

    // System notifications for new order/booking notifications
    suspend fun setNotificationsEnabled(enabled: Boolean) = write(NOTIFICATIONS_KEY, enabled)
    fun getNotificationsEnabled(): Flow<Boolean> = read(NOTIFICATIONS_KEY, true)

    suspend fun getLastNotifiedId(): Int = read(LAST_NOTIFIED_ID_KEY, 0).first()
    suspend fun setLastNotifiedId(id: Int) = write(LAST_NOTIFIED_ID_KEY, id)

    // Custom API base URL (debug builds); null means the build-time default
    suspend fun getServerUrl(): String? =
        context?.settingsDataStore?.data?.first()?.get(SERVER_URL_KEY)

    suspend fun setServerUrl(url: String?) {
        context?.settingsDataStore?.edit {
            if (url == null) it.remove(SERVER_URL_KEY) else it[SERVER_URL_KEY] = url
        }
    }
}
