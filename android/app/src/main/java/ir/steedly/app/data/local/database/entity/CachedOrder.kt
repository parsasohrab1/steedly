package ir.steedly.app.data.local.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "cached_orders")
data class CachedOrder(
    @PrimaryKey val id: Int,
    val order_number: String,
    val total_amount: Double,
    val status: String,
    val shipping_address: String,
    val payment_status: String,
    val payment_method: String?,
    val created_at: String,
    val cached_at: Long = System.currentTimeMillis()
)

