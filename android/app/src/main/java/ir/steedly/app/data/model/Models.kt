package ir.steedly.app.data.model

// Note: Postgres DECIMAL columns arrive as JSON strings ("12000.00");
// Gson parses quoted numbers into Double fields, so they are typed as numbers here.
// Fields that can be NULL in the database are nullable.

// ---------- Auth ----------
data class RegisterRequest(
    val email: String,
    val password: String,
    val full_name: String,
    val phone: String? = null
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class AuthData(
    val user: User,
    val token: String
)

data class User(
    val id: Int? = null,
    val email: String,
    val full_name: String? = null,
    val phone: String? = null,
    val role: String? = "user",
    val avatar_url: String? = null,
    val created_at: String? = null
)

data class UpdateProfileRequest(
    val full_name: String? = null,
    val phone: String? = null,
    val avatar_url: String? = null
)

data class ForgotPasswordRequest(val email: String)

data class UploadResult(
    val url: String,
    val filename: String?
)

// ---------- Blog ----------
data class BlogPost(
    val id: Int,
    val title: String,
    val slug: String,
    val excerpt: String?,
    val content: String?, // omitted in list responses
    val featured_image: String?,
    val category_id: Int?,
    val category_name: String?,
    val category_slug: String?,
    val author_id: Int?,
    val author_name: String?,
    val views_count: Int?,
    val published_at: String?,
    val created_at: String?
)

data class BlogPostsData(
    val posts: List<BlogPost>,
    val pagination: Pagination
)

data class Pagination(
    val page: Int,
    val limit: Int,
    val total: Int,
    val totalPages: Int
)

data class BlogCategory(
    val id: Int,
    val name: String,
    val slug: String,
    val description: String?,
    val parent_id: Int?
)

// ---------- Services ----------
data class Veterinarian(
    val id: Int,
    val user_id: Int?,
    val full_name: String,
    val specialization: String?,
    val region: String?,
    val phone: String,
    val email: String?,
    val resume: String?,
    val image_url: String?,
    val latitude: Double?,
    val longitude: Double?,
    val address: String?,
    val rating: Double?,
    val total_reviews: Int?,
    val is_verified: Boolean?,
    val distance: Double? = null
)

data class Transporter(
    val id: Int,
    val user_id: Int?,
    val company_name: String?,
    val contact_name: String,
    val phone: String,
    val email: String?,
    val region: String?,
    val latitude: Double?,
    val longitude: Double?,
    val address: String?,
    val equipment: String?,
    val transport_info: String?,
    val rating: Double?,
    val total_reviews: Int?,
    val is_verified: Boolean?,
    val distance: Double? = null
)

object ServiceType {
    const val VETERINARIAN = "veterinarian"
    const val TRANSPORTER = "transporter"

    fun label(type: String) = if (type == VETERINARIAN) "دامپزشک" else "اسب‌کش"
}

/** Veterinarians and transporters shown through one UI model. */
data class ServiceProvider(
    val id: Int,
    val type: String,
    val title: String,
    val subtitle: String?,
    val region: String?,
    val phone: String,
    val address: String?,
    val imageUrl: String?,
    val latitude: Double?,
    val longitude: Double?,
    val rating: Double,
    val totalReviews: Int,
    val isVerified: Boolean,
    val distance: Double?,
    val details: List<Pair<String, String>>
)

fun Veterinarian.toProvider() = ServiceProvider(
    id = id,
    type = ServiceType.VETERINARIAN,
    title = full_name,
    subtitle = specialization,
    region = region,
    phone = phone,
    address = address,
    imageUrl = image_url,
    latitude = latitude,
    longitude = longitude,
    rating = rating ?: 0.0,
    totalReviews = total_reviews ?: 0,
    isVerified = is_verified == true,
    distance = distance,
    details = listOfNotNull(
        specialization?.let { "تخصص" to it },
        resume?.let { "سوابق" to it },
        email?.let { "ایمیل" to it }
    )
)

fun Transporter.toProvider() = ServiceProvider(
    id = id,
    type = ServiceType.TRANSPORTER,
    title = company_name ?: contact_name,
    subtitle = if (company_name != null) contact_name else null,
    region = region,
    phone = phone,
    address = address,
    imageUrl = null,
    latitude = latitude,
    longitude = longitude,
    rating = rating ?: 0.0,
    totalReviews = total_reviews ?: 0,
    isVerified = is_verified == true,
    distance = distance,
    details = listOfNotNull(
        equipment?.let { "تجهیزات" to it },
        transport_info?.let { "اطلاعات حمل" to it },
        email?.let { "ایمیل" to it }
    )
)

data class BookingRequest(
    val service_type: String,
    val service_provider_id: Int,
    val booking_date: String,
    val description: String?
)

data class Booking(
    val id: Int,
    val user_id: Int?,
    val service_type: String,
    val service_provider_id: Int,
    val booking_date: String,
    val description: String?,
    val status: String,
    val created_at: String?,
    val provider_name: String? = null,
    val provider_phone: String? = null,
    val has_review: Boolean? = null
)

data class BookingStatusRequest(val status: String)

data class Review(
    val id: Int,
    val rating: Int,
    val comment: String?,
    val reviewer_name: String?,
    val created_at: String?
)

data class ReviewRequest(
    val booking_id: Int?,
    val service_provider_id: Int,
    val service_type: String,
    val rating: Int,
    val comment: String?
)

// ---------- Shop ----------
data class Product(
    val id: Int,
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
    val is_active: Boolean?
)

data class ProductsData(
    val products: List<Product>,
    val pagination: Pagination
)

data class ProductCategory(
    val id: Int,
    val name: String,
    val slug: String,
    val description: String?,
    val parent_id: Int?,
    val image_url: String?
)

data class OrderRequest(
    val items: List<OrderItemRequest>,
    val shipping_address: String,
    val payment_method: String
)

data class OrderItemRequest(
    val product_id: Int,
    val quantity: Int
)

data class Order(
    val id: Int,
    val user_id: Int?,
    val order_number: String,
    val total_amount: Double,
    val status: String,
    val shipping_address: String?,
    val payment_status: String,
    val payment_method: String?,
    val created_at: String?,
    val items: List<OrderItem>? = null
)

data class OrderItem(
    val id: Int?,
    val product_id: Int?,
    val quantity: Int,
    val price: Double,
    val product_name: String? = null,
    val product_image: String? = null
)

data class PaymentStartRequest(val client: String = "android")

data class PaymentStart(
    val payment_url: String,
    val authority: String,
    val gateway: String?
)

data class Payment(
    val id: Int,
    val amount: Double,
    val status: String,
    val ref_id: String?,
    val created_at: String?
)

// ---------- Competitions ----------
data class Competition(
    val id: Int,
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
    val is_international: Boolean?,
    val is_published: Boolean?
)

data class CompetitionResult(
    val id: Int,
    val competition_id: Int?,
    val position: Int?,
    val participant_name: String?,
    val horse_name: String?,
    val score: Double?,
    val notes: String?
)

// ---------- Notifications ----------
data class AppNotification(
    val id: Int,
    val type: String,
    val title: String,
    val message: String,
    val link: String?,
    val is_read: Boolean,
    val created_at: String?
)

data class UnreadCount(val count: Int)

// ---------- Search ----------
data class SearchData(
    val query: String?,
    val results: SearchResults,
    val total: Int
)

// Gson bypasses Kotlin default values, so absent lists arrive as null
data class SearchResults(
    val blog: List<SearchBlogItem>?,
    val products: List<SearchProductItem>?,
    val competitions: List<SearchCompetitionItem>?
)

data class SearchBlogItem(
    val id: Int,
    val title: String,
    val slug: String,
    val excerpt: String?,
    val featured_image: String?
)

data class SearchProductItem(
    val id: Int,
    val name: String,
    val slug: String,
    val price: Double?,
    val image_url: String?
)

data class SearchCompetitionItem(
    val id: Int,
    val title: String,
    val slug: String,
    val location: String?,
    val start_date: String?
)
