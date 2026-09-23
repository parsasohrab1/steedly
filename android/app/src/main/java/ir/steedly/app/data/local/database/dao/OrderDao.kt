package ir.steedly.app.data.local.database.dao

import androidx.room.*
import ir.steedly.app.data.local.database.entity.CachedOrder
import kotlinx.coroutines.flow.Flow

@Dao
interface OrderDao {
    @Query("SELECT * FROM cached_orders WHERE id = :id")
    suspend fun getOrder(id: Int): CachedOrder?
    
    @Query("SELECT * FROM cached_orders ORDER BY cached_at DESC")
    fun getAllOrders(): Flow<List<CachedOrder>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrder(order: CachedOrder)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrders(orders: List<CachedOrder>)
    
    @Query("DELETE FROM cached_orders WHERE id = :id")
    suspend fun deleteOrder(id: Int)
    
    @Query("DELETE FROM cached_orders")
    suspend fun clearAll()
}

