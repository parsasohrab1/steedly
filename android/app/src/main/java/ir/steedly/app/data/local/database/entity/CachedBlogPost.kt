package ir.steedly.app.data.local.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "cached_blog_posts")
data class CachedBlogPost(
    @PrimaryKey val id: Int,
    val title: String,
    val slug: String,
    val excerpt: String?,
    val content: String,
    val featured_image: String?,
    val category_id: Int?,
    val category_name: String?,
    val author_id: Int?,
    val author_name: String?,
    val views_count: Int,
    val published_at: String?,
    val cached_at: Long = System.currentTimeMillis()
)

