package ir.steedly.app.data.local.database.dao

import androidx.room.*
import ir.steedly.app.data.local.database.entity.CachedBlogPost
import kotlinx.coroutines.flow.Flow

@Dao
interface BlogPostDao {
    @Query("SELECT * FROM cached_blog_posts WHERE id = :id")
    suspend fun getPost(id: Int): CachedBlogPost?
    
    @Query("SELECT * FROM cached_blog_posts WHERE slug = :slug")
    suspend fun getPostBySlug(slug: String): CachedBlogPost?
    
    @Query("SELECT * FROM cached_blog_posts ORDER BY cached_at DESC")
    fun getAllPosts(): Flow<List<CachedBlogPost>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPost(post: CachedBlogPost)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPosts(posts: List<CachedBlogPost>)
    
    @Query("DELETE FROM cached_blog_posts WHERE cached_at < :timestamp")
    suspend fun deleteOldPosts(timestamp: Long)
    
    @Query("DELETE FROM cached_blog_posts")
    suspend fun clearAll()
}

