package ir.steedly.app.data.local.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "cached_bookings")
data class CachedBooking(
    @PrimaryKey val id: Int,
    val service_type: String,
    val service_provider_id: Int,
    val booking_date: String,
    val description: String?,
    val status: String,
    val created_at: String,
    val cached_at: Long = System.currentTimeMillis()
)

