package ir.steedly.app.data.local.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "cached_competitions")
data class CachedCompetition(
    @PrimaryKey val id: Int,
    val title: String,
    val slug: String,
    val description: String?,
    val competition_type: String?,
    val location: String,
    val start_date: String,
    val end_date: String?,
    val registration_deadline: String?,
    val prize_info: String?,
    val conditions: String?,
    val image_url: String?,
    val is_international: Boolean,
    val cached_at: Long = System.currentTimeMillis()
)

