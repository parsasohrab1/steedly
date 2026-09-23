package ir.steedly.app.repository

import android.content.Context
import ir.steedly.app.data.local.SettingsManager
import ir.steedly.app.data.local.database.AppDatabase
import ir.steedly.app.data.local.database.entity.CachedBlogPost
import ir.steedly.app.data.local.database.entity.CachedCompetition
import ir.steedly.app.data.local.database.entity.CachedProduct
import ir.steedly.app.data.model.BlogPost
import ir.steedly.app.data.model.Competition
import ir.steedly.app.data.model.Product
import kotlinx.coroutines.flow.first

/**
 * Local copy of browsed content. Screens write here after a successful fetch
 * (when offline mode is on) and read from here when the network call fails.
 */
class OfflineRepository(private val database: AppDatabase) {

    // Products
    suspend fun cacheProducts(products: List<Product>) {
        if (!SettingsManager.isOfflineModeEnabled()) return
        database.productDao().insertProducts(products.map { it.toCached() })
    }

    suspend fun getCachedProducts(): List<Product> =
        database.productDao().getAllProducts().first().map { it.toProduct() }

    suspend fun getCachedProduct(slug: String): Product? =
        database.productDao().getProductBySlug(slug)?.toProduct()

    // Blog
    suspend fun cacheBlogPosts(posts: List<BlogPost>) {
        if (!SettingsManager.isOfflineModeEnabled()) return
        // Keep full content already cached from the detail screen
        val merged = posts.map { post ->
            val existing = database.blogPostDao().getPost(post.id)
            post.toCached(content = post.content ?: existing?.content ?: "")
        }
        database.blogPostDao().insertPosts(merged)
    }

    suspend fun cacheBlogPost(post: BlogPost) {
        if (!SettingsManager.isOfflineModeEnabled()) return
        database.blogPostDao().insertPost(post.toCached(content = post.content ?: ""))
    }

    suspend fun getCachedBlogPosts(): List<BlogPost> =
        database.blogPostDao().getAllPosts().first().map { it.toBlogPost() }

    suspend fun getCachedBlogPost(slug: String): BlogPost? =
        database.blogPostDao().getPostBySlug(slug)?.takeIf { it.content.isNotBlank() }?.toBlogPost()

    // Competitions
    suspend fun cacheCompetitions(competitions: List<Competition>) {
        if (!SettingsManager.isOfflineModeEnabled()) return
        database.competitionDao().insertCompetitions(competitions.map { it.toCached() })
    }

    suspend fun getCachedCompetitions(): List<Competition> =
        database.competitionDao().getAllCompetitions().first().map { it.toCompetition() }

    suspend fun getCachedCompetition(slug: String): Competition? =
        database.competitionDao().getCompetitionBySlug(slug)?.toCompetition()

    suspend fun clearAll() {
        database.productDao().clearAll()
        database.blogPostDao().clearAll()
        database.competitionDao().clearAll()
        database.orderDao().clearAll()
        database.bookingDao().clearAll()
    }

    // Mapping
    private fun Product.toCached() = CachedProduct(
        id = id,
        name = name,
        slug = slug,
        description = description,
        short_description = short_description,
        price = price,
        compare_at_price = compare_at_price,
        sku = sku,
        stock_quantity = stock_quantity,
        category_id = category_id,
        category_name = category_name,
        images = images,
        is_active = is_active ?: true
    )

    private fun CachedProduct.toProduct() = Product(
        id = id,
        name = name,
        slug = slug,
        description = description,
        short_description = short_description,
        price = price,
        compare_at_price = compare_at_price,
        sku = sku,
        stock_quantity = stock_quantity,
        category_id = category_id,
        category_name = category_name,
        images = images,
        is_active = is_active
    )

    private fun BlogPost.toCached(content: String) = CachedBlogPost(
        id = id,
        title = title,
        slug = slug,
        excerpt = excerpt,
        content = content,
        featured_image = featured_image,
        category_id = category_id,
        category_name = category_name,
        author_id = author_id,
        author_name = author_name,
        views_count = views_count ?: 0,
        published_at = published_at
    )

    private fun CachedBlogPost.toBlogPost() = BlogPost(
        id = id,
        title = title,
        slug = slug,
        excerpt = excerpt,
        content = content,
        featured_image = featured_image,
        category_id = category_id,
        category_name = category_name,
        category_slug = null,
        author_id = author_id,
        author_name = author_name,
        views_count = views_count,
        published_at = published_at,
        created_at = null
    )

    private fun Competition.toCached() = CachedCompetition(
        id = id,
        title = title,
        slug = slug,
        description = description,
        competition_type = competition_type,
        location = location,
        start_date = start_date,
        end_date = end_date,
        registration_deadline = registration_deadline,
        prize_info = prize_info,
        conditions = conditions,
        image_url = image_url,
        is_international = is_international == true
    )

    private fun CachedCompetition.toCompetition() = Competition(
        id = id,
        title = title,
        slug = slug,
        description = description,
        competition_type = competition_type,
        location = location,
        start_date = start_date,
        end_date = end_date,
        registration_deadline = registration_deadline,
        prize_info = prize_info,
        conditions = conditions,
        image_url = image_url,
        is_international = is_international,
        is_published = true
    )

    companion object {
        @Volatile
        private var instance: OfflineRepository? = null

        fun get(context: Context): OfflineRepository =
            instance ?: synchronized(this) {
                instance ?: OfflineRepository(AppDatabase.getDatabase(context)).also { instance = it }
            }
    }
}
