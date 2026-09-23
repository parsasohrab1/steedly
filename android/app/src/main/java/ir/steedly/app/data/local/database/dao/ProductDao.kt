package ir.steedly.app.data.local.database.dao

import androidx.room.*
import ir.steedly.app.data.local.database.entity.CachedProduct
import kotlinx.coroutines.flow.Flow

@Dao
interface ProductDao {
    @Query("SELECT * FROM cached_products WHERE id = :id")
    suspend fun getProduct(id: Int): CachedProduct?
    
    @Query("SELECT * FROM cached_products WHERE slug = :slug")
    suspend fun getProductBySlug(slug: String): CachedProduct?
    
    @Query("SELECT * FROM cached_products ORDER BY cached_at DESC")
    fun getAllProducts(): Flow<List<CachedProduct>>
    
    @Query("SELECT * FROM cached_products WHERE category_id = :categoryId ORDER BY cached_at DESC")
    fun getProductsByCategory(categoryId: Int): Flow<List<CachedProduct>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProduct(product: CachedProduct)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProducts(products: List<CachedProduct>)
    
    @Query("DELETE FROM cached_products WHERE id = :id")
    suspend fun deleteProduct(id: Int)
    
    @Query("DELETE FROM cached_products WHERE cached_at < :timestamp")
    suspend fun deleteOldProducts(timestamp: Long)
    
    @Query("DELETE FROM cached_products")
    suspend fun clearAll()
}

