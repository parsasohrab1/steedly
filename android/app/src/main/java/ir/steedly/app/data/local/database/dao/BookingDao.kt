package ir.steedly.app.data.local.database.dao

import androidx.room.*
import ir.steedly.app.data.local.database.entity.CachedBooking
import kotlinx.coroutines.flow.Flow

@Dao
interface BookingDao {
    @Query("SELECT * FROM cached_bookings WHERE id = :id")
    suspend fun getBooking(id: Int): CachedBooking?
    
    @Query("SELECT * FROM cached_bookings ORDER BY cached_at DESC")
    fun getAllBookings(): Flow<List<CachedBooking>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBooking(booking: CachedBooking)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBookings(bookings: List<CachedBooking>)
    
    @Query("DELETE FROM cached_bookings WHERE id = :id")
    suspend fun deleteBooking(id: Int)
    
    @Query("DELETE FROM cached_bookings")
    suspend fun clearAll()
}

