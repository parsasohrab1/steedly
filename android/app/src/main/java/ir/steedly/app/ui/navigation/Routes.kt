package ir.steedly.app.ui.navigation

import android.net.Uri

object Routes {
    const val HOME = "home"
    const val BLOG = "blog"
    const val BLOG_DETAIL = "blog/{slug}"
    const val SHOP = "shop"
    const val PRODUCT = "shop/product/{slug}"
    const val CART = "cart"
    const val CHECKOUT = "checkout"
    const val SERVICES = "services"
    const val PROVIDER = "services/provider/{type}/{id}"
    const val MAP = "services/map/{type}"
    const val BOOKING = "services/booking/{type}/{id}"
    const val COMPETITIONS = "competitions"
    const val COMPETITION_DETAIL = "competitions/{slug}"
    const val LOGIN = "login"
    const val FORGOT_PASSWORD = "forgot_password"
    const val PROFILE = "profile"
    const val ORDERS = "orders"
    const val ORDER_DETAIL = "orders/{id}"
    const val BOOKINGS = "bookings"
    const val NOTIFICATIONS = "notifications"
    const val SEARCH = "search"
    const val SETTINGS = "settings"
    const val PAYMENT_RESULT = "payment_result/{orderId}?status={status}&refId={refId}"

    fun blog(slug: String) = "blog/${Uri.encode(slug)}"
    fun product(slug: String) = "shop/product/${Uri.encode(slug)}"
    fun provider(type: String, id: Int) = "services/provider/$type/$id"
    fun map(type: String) = "services/map/$type"
    fun booking(type: String, id: Int) = "services/booking/$type/$id"
    fun competition(slug: String) = "competitions/${Uri.encode(slug)}"
    fun order(id: Int) = "orders/$id"
    fun paymentResult(orderId: Int, status: String, refId: String?) =
        "payment_result/$orderId?status=${Uri.encode(status)}&refId=${Uri.encode(refId ?: "")}"

    /** Top-level destinations that show the bottom navigation bar. */
    val topLevel = setOf(HOME, BLOG, SHOP, SERVICES, COMPETITIONS)

    /**
     * Maps a web path stored in a notification ("/profile/orders/12") or a
     * payment deep link ("steedly://payment/result?...") to an app route.
     */
    fun fromLink(link: String?): String? {
        if (link.isNullOrBlank()) return null
        val uri = Uri.parse(link)
        if (uri.host == "payment") {
            val orderId = uri.getQueryParameter("order_id")?.toIntOrNull() ?: return ORDERS
            return paymentResult(orderId, uri.getQueryParameter("payment") ?: "failed", uri.getQueryParameter("ref_id"))
        }
        val segments = uri.pathSegments
        return when {
            segments.size >= 3 && segments[0] == "profile" && segments[1] == "orders" ->
                segments[2].toIntOrNull()?.let { order(it) } ?: ORDERS
            segments.size >= 2 && segments[0] == "profile" && segments[1] == "orders" -> ORDERS
            segments.size >= 2 && segments[0] == "profile" && segments[1] == "bookings" -> BOOKINGS
            segments.size >= 2 && segments[0] == "orders" -> segments[1].toIntOrNull()?.let { order(it) }
            segments.size >= 2 && segments[0] == "blog" -> blog(segments[1])
            segments.size >= 2 && segments[0] == "shop" -> product(segments[1])
            segments.size >= 2 && segments[0] == "competitions" -> competition(segments[1])
            else -> NOTIFICATIONS
        }
    }
}
