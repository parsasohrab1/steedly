package ir.steedly.app.work

import android.content.Context
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

object WorkManagerInitializer {
    fun initialize(context: Context) {
        val workManager = WorkManager.getInstance(context)

        // Periodic cache cleanup (every 24 hours, only when charging and on WiFi)
        val cacheCleanupConstraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.UNMETERED)
            .setRequiresCharging(true)
            .build()

        val cacheCleanupWork = PeriodicWorkRequestBuilder<CacheCleanupWorker>(24, TimeUnit.HOURS)
            .setConstraints(cacheCleanupConstraints)
            .build()

        workManager.enqueueUniquePeriodicWork(
            "cache_cleanup",
            ExistingPeriodicWorkPolicy.KEEP,
            cacheCleanupWork
        )

        // Notification sync every 15 minutes (WorkManager's minimum) when online
        val syncWork = PeriodicWorkRequestBuilder<NotificationSyncWorker>(15, TimeUnit.MINUTES)
            .setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .setRequiresBatteryNotLow(true)
                    .build()
            )
            .build()

        workManager.enqueueUniquePeriodicWork(
            "notification_sync",
            ExistingPeriodicWorkPolicy.KEEP,
            syncWork
        )
    }
}
