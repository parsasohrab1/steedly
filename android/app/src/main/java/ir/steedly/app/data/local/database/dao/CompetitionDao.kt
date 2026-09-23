package ir.steedly.app.data.local.database.dao

import androidx.room.*
import ir.steedly.app.data.local.database.entity.CachedCompetition
import kotlinx.coroutines.flow.Flow

@Dao
interface CompetitionDao {
    @Query("SELECT * FROM cached_competitions WHERE id = :id")
    suspend fun getCompetition(id: Int): CachedCompetition?
    
    @Query("SELECT * FROM cached_competitions WHERE slug = :slug")
    suspend fun getCompetitionBySlug(slug: String): CachedCompetition?
    
    @Query("SELECT * FROM cached_competitions ORDER BY cached_at DESC")
    fun getAllCompetitions(): Flow<List<CachedCompetition>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCompetition(competition: CachedCompetition)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCompetitions(competitions: List<CachedCompetition>)
    
    @Query("DELETE FROM cached_competitions WHERE cached_at < :timestamp")
    suspend fun deleteOldCompetitions(timestamp: Long)
    
    @Query("DELETE FROM cached_competitions")
    suspend fun clearAll()
}

