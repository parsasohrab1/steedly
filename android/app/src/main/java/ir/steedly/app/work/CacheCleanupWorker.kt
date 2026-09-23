package ir.steedly.app.work

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import ir.steedly.app.data.local.database.AppDatabase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class CacheCleanupWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {
    
    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            val database = AppDatabase.getDatabase(applicationContext)
            
            // Delete cached data older than 7 days
            val sevenDaysAgo = System.currentTimeMillis() - (7 * 24 * 60 * 60 * 1000L)
            
            database.productDao().deleteOldProducts(sevenDaysAgo)
            database.blogPostDao().deleteOldPosts(sevenDaysAgo)
            database.competitionDao().deleteOldCompetitions(sevenDaysAgo)
            
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}

