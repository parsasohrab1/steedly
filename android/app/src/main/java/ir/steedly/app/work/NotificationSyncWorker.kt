package ir.steedly.app.work

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import ir.steedly.app.MainActivity
import ir.steedly.app.R
import ir.steedly.app.data.local.SettingsManager
import ir.steedly.app.data.local.TokenManager
import ir.steedly.app.data.remote.RetrofitClient
import ir.steedly.app.data.remote.apiCall
import kotlinx.coroutines.flow.first

/**
 * Polls the backend for unread in-app notifications and mirrors new ones as
 * system notifications. Used instead of FCM so the app works without Google
 * Play Services (common on devices in Iran).
 */
class NotificationSyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        TokenManager.init(applicationContext)
        SettingsManager.init(applicationContext)
        if (!TokenManager.isLoggedIn) return Result.success()
        if (!SettingsManager.getNotificationsEnabled().first()) return Result.success()

        val notifications = apiCall { RetrofitClient.apiService.getNotifications(limit = 20) }
            .getOrElse { return Result.retry() }

        val lastNotifiedId = SettingsManager.getLastNotifiedId()
        val fresh = notifications
            .filter { !it.is_read && it.id > lastNotifiedId }
            .sortedBy { it.id }

        // First run after login: remember the latest id without flooding the tray
        if (lastNotifiedId == 0) {
            notifications.maxOfOrNull { it.id }?.let { SettingsManager.setLastNotifiedId(it) }
            return Result.success()
        }

        fresh.forEach { show(applicationContext, it.id, it.title, it.message, it.link) }
        fresh.lastOrNull()?.let { SettingsManager.setLastNotifiedId(it.id) }
        return Result.success()
    }

    companion object {
        const val CHANNEL_ID = "orders_bookings"
        const val EXTRA_LINK = "notification_link"

        fun createChannel(context: Context) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
            val channel = NotificationChannel(
                CHANNEL_ID,
                context.getString(R.string.notification_channel_name),
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = context.getString(R.string.notification_channel_description)
            }
            context.getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }

        fun show(context: Context, id: Int, title: String, message: String, link: String?) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
                ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) !=
                PackageManager.PERMISSION_GRANTED
            ) {
                return
            }

            val intent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra(EXTRA_LINK, link ?: "/notifications")
            }
            val pendingIntent = PendingIntent.getActivity(
                context,
                id,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val notification = NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle(title)
                .setContentText(message)
                .setStyle(NotificationCompat.BigTextStyle().bigText(message))
                .setContentIntent(pendingIntent)
                .setAutoCancel(true)
                .build()

            NotificationManagerCompat.from(context).notify(id, notification)
        }
    }
}
