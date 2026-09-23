package ir.steedly.app.data.remote

import ir.steedly.app.data.model.*
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    // Auth
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<ApiResponse<AuthData>>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<ApiResponse<AuthData>>

    @GET("auth/profile")
    suspend fun getProfile(): Response<ApiResponse<User>>

    @PUT("auth/profile")
    suspend fun updateProfile(@Body request: UpdateProfileRequest): Response<ApiResponse<User>>

    @POST("auth/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<MessageResponse>

    @Multipart
    @POST("upload/avatar")
    suspend fun uploadAvatar(@Part avatar: MultipartBody.Part): Response<ApiResponse<UploadResult>>

    // Blog
    @GET("blog/posts")
    suspend fun getBlogPosts(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 10,
        @Query("category_id") categoryId: Int? = null
    ): Response<ApiResponse<BlogPostsData>>

    @GET("blog/posts/{slug}")
    suspend fun getBlogPost(@Path("slug") slug: String): Response<ApiResponse<BlogPost>>

    @GET("blog/categories")
    suspend fun getBlogCategories(): Response<ApiResponse<List<BlogCategory>>>

    // Services
    @GET("services/veterinarians")
    suspend fun getVeterinarians(
        @Query("region") region: String? = null,
        @Query("specialization") specialization: String? = null,
        @Query("latitude") latitude: Double? = null,
        @Query("longitude") longitude: Double? = null,
        @Query("radius") radius: Int? = null
    ): Response<ApiResponse<List<Veterinarian>>>

    @GET("services/veterinarians/{id}")
    suspend fun getVeterinarian(@Path("id") id: Int): Response<ApiResponse<Veterinarian>>

    @GET("services/transporters")
    suspend fun getTransporters(
        @Query("region") region: String? = null,
        @Query("latitude") latitude: Double? = null,
        @Query("longitude") longitude: Double? = null,
        @Query("radius") radius: Int? = null
    ): Response<ApiResponse<List<Transporter>>>

    @GET("services/transporters/{id}")
    suspend fun getTransporter(@Path("id") id: Int): Response<ApiResponse<Transporter>>

    @GET("services/reviews/{serviceType}/{providerId}")
    suspend fun getReviews(
        @Path("serviceType") serviceType: String,
        @Path("providerId") providerId: Int
    ): Response<ApiResponse<List<Review>>>

    @POST("services/reviews")
    suspend fun createReview(@Body request: ReviewRequest): Response<ApiResponse<Review>>

    @POST("services/bookings")
    suspend fun createBooking(@Body booking: BookingRequest): Response<ApiResponse<Booking>>

    @GET("services/bookings")
    suspend fun getBookings(): Response<ApiResponse<List<Booking>>>

    @PUT("services/bookings/{id}/status")
    suspend fun updateBookingStatus(
        @Path("id") id: Int,
        @Body request: BookingStatusRequest
    ): Response<ApiResponse<Booking>>

    // Shop
    @GET("shop/products")
    suspend fun getProducts(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 12,
        @Query("category_id") categoryId: Int? = null,
        @Query("search") search: String? = null
    ): Response<ApiResponse<ProductsData>>

    @GET("shop/products/{slug}")
    suspend fun getProduct(@Path("slug") slug: String): Response<ApiResponse<Product>>

    @GET("shop/categories")
    suspend fun getProductCategories(): Response<ApiResponse<List<ProductCategory>>>

    @POST("shop/orders")
    suspend fun createOrder(@Body order: OrderRequest): Response<ApiResponse<Order>>

    @GET("shop/orders")
    suspend fun getOrders(): Response<ApiResponse<List<Order>>>

    @GET("shop/orders/{id}")
    suspend fun getOrder(@Path("id") id: Int): Response<ApiResponse<Order>>

    @PUT("shop/orders/{id}/cancel")
    suspend fun cancelOrder(@Path("id") id: Int): Response<ApiResponse<Order>>

    // Payments
    @POST("payments/orders/{orderId}/request")
    suspend fun requestPayment(
        @Path("orderId") orderId: Int,
        @Body request: PaymentStartRequest = PaymentStartRequest()
    ): Response<ApiResponse<PaymentStart>>

    @GET("payments/orders/{orderId}")
    suspend fun getOrderPayments(@Path("orderId") orderId: Int): Response<ApiResponse<List<Payment>>>

    // Competitions
    @GET("competitions")
    suspend fun getCompetitions(
        @Query("type") type: String? = null,
        @Query("is_international") isInternational: Boolean? = null,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): Response<ApiResponse<List<Competition>>>

    @GET("competitions/{slug}")
    suspend fun getCompetition(@Path("slug") slug: String): Response<ApiResponse<Competition>>

    @GET("competitions/{id}/results")
    suspend fun getCompetitionResults(@Path("id") id: Int): Response<ApiResponse<List<CompetitionResult>>>

    // Notifications
    @GET("notifications")
    suspend fun getNotifications(@Query("limit") limit: Int = 30): Response<ApiResponse<List<AppNotification>>>

    @GET("notifications/unread-count")
    suspend fun getUnreadCount(): Response<ApiResponse<UnreadCount>>

    @PUT("notifications/{id}/read")
    suspend fun markNotificationRead(@Path("id") id: Int): Response<MessageResponse>

    @PUT("notifications/read-all")
    suspend fun markAllNotificationsRead(): Response<MessageResponse>

    @DELETE("notifications/{id}")
    suspend fun deleteNotification(@Path("id") id: Int): Response<MessageResponse>

    // Search
    @GET("search")
    suspend fun search(
        @Query("q") query: String,
        @Query("type") type: String? = null,
        @Query("limit") limit: Int = 10
    ): Response<ApiResponse<SearchData>>
}
