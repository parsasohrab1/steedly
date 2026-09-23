package ir.steedly.app.data.local.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters
import ir.steedly.app.data.local.database.converter.StringListConverter

@Entity(tableName = "cached_products")
@TypeConverters(StringListConverter::class)
data class CachedProduct(
    @PrimaryKey val id: Int,
    val name: String,
    val slug: String,
    val description: String?,
    val short_description: String?,
    val price: Double,
    val compare_at_price: Double?,
    val sku: String?,
    val stock_quantity: Int,
    val category_id: Int?,
    val category_name: String?,
    val images: List<String>?,
    val is_active: Boolean,
    val cached_at: Long = System.currentTimeMillis()
)

