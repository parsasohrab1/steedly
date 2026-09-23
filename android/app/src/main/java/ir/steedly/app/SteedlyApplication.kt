package ir.steedly.app

import android.app.Application
import coil.ImageLoader
import coil.ImageLoaderFactory
import ir.steedly.app.data.local.CartManager
import ir.steedly.app.data.local.SettingsManager
import ir.steedly.app.data.local.TokenManager
import ir.steedly.app.data.local.database.AppDatabase
import ir.steedly.app.utils.ImageCacheConfig
import ir.steedly.app.work.NotificationSyncWorker
import ir.steedly.app.work.WorkManagerInitializer

class SteedlyApplication : Application(), ImageLoaderFactory {

    val database: AppDatabase by lazy {
        AppDatabase.getDatabase(this)
    }

    override fun onCreate() {
        super.onCreate()

        TokenManager.init(this)
        SettingsManager.init(this)
        CartManager.init(this)

        NotificationSyncWorker.createChannel(this)
        WorkManagerInitializer.initialize(this)
    }

    // Coil picks this up for every AsyncImage in the app (memory + disk cache)
    override fun newImageLoader(): ImageLoader = ImageCacheConfig.createImageLoader(this)
}
