package ir.steedly.app.data.local.database

import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import android.content.Context
import ir.steedly.app.data.local.database.dao.*
import ir.steedly.app.data.local.database.entity.*

@Database(
    entities = [
        CachedProduct::class,
        CachedBlogPost::class,
        CachedCompetition::class,
        CachedOrder::class,
        CachedBooking::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun productDao(): ProductDao
    abstract fun blogPostDao(): BlogPostDao
    abstract fun competitionDao(): CompetitionDao
    abstract fun orderDao(): OrderDao
    abstract fun bookingDao(): BookingDao
    
    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null
        
        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "steedly_database"
                )
                    .fallbackToDestructiveMigration() // For development
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}

