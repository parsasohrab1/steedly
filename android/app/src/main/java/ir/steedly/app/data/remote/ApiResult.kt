package ir.steedly.app.data.remote

import com.google.gson.JsonParser
import ir.steedly.app.data.model.ApiResponse
import ir.steedly.app.data.model.MessageResponse
import retrofit2.Response
import java.io.IOException
import kotlin.coroutines.cancellation.CancellationException

/** Error surfaced to the UI, already translated to Persian. */
class ApiException(message: String, val code: Int? = null) : Exception(message)

// Backend error messages are English; show Persian equivalents to users
private val knownMessages = mapOf(
    "Invalid credentials" to "ایمیل یا رمز عبور اشتباه است",
    "User already exists" to "کاربری با این ایمیل قبلاً ثبت‌نام کرده است",
    "Account is deactivated" to "حساب کاربری شما غیرفعال شده است",
    "Authentication required" to "لطفاً وارد حساب کاربری شوید",
    "Invalid token" to "نشست شما منقضی شده است، دوباره وارد شوید",
    "Insufficient permissions" to "دسترسی لازم را ندارید",
    "Please provide a valid email" to "ایمیل معتبر وارد کنید",
    "Password must be at least 6 characters" to "رمز عبور باید حداقل ۶ کاراکتر باشد",
    "Full name is required" to "نام کامل الزامی است",
    "Order is already paid" to "این سفارش قبلاً پرداخت شده است",
    "Order is cancelled" to "این سفارش لغو شده است",
    "Only unpaid pending orders can be cancelled" to "فقط سفارش‌های پرداخت‌نشده در انتظار قابل لغو هستند",
    "Order not found" to "سفارش یافت نشد",
    "Booking not found" to "رزرو یافت نشد",
    "Post not found" to "مقاله یافت نشد",
    "Competition not found" to "مسابقه یافت نشد",
    "Only completed bookings can be reviewed" to "فقط برای رزروهای انجام‌شده می‌توانید نظر ثبت کنید",
    "This booking has already been reviewed" to "برای این رزرو قبلاً نظر ثبت کرده‌اید"
)

private fun translate(message: String?): String? {
    if (message.isNullOrBlank()) return null
    knownMessages[message]?.let { return it }
    return when {
        message.startsWith("Insufficient stock for") ->
            "موجودی کافی نیست: " + message.removePrefix("Insufficient stock for").trim()
        message.startsWith("Payment gateway error") -> "خطا در اتصال به درگاه پرداخت"
        message.startsWith("Booking is already") -> "وضعیت این رزرو قابل تغییر نیست"
        else -> message
    }
}

private fun errorMessage(response: Response<*>): ApiException {
    val raw = try {
        response.errorBody()?.string()
    } catch (e: Exception) {
        null
    }
    val serverMessage = try {
        raw?.let { JsonParser.parseString(it).asJsonObject.get("message")?.asString }
    } catch (e: Exception) {
        null
    }
    val fallback = when (response.code()) {
        401 -> "لطفاً وارد حساب کاربری شوید"
        403 -> "دسترسی لازم را ندارید"
        404 -> "مورد درخواستی یافت نشد"
        in 500..599 -> "خطای سرور، لطفاً بعداً تلاش کنید"
        else -> "خطای نامشخص (${response.code()})"
    }
    return ApiException(translate(serverMessage) ?: fallback, response.code())
}

private fun networkError(e: Exception): ApiException = when (e) {
    is ApiException -> e
    is IOException -> ApiException("اتصال به اینترنت برقرار نیست")
    else -> ApiException("خطا: ${e.message ?: e.javaClass.simpleName}")
}

/** Runs a call that returns the standard `{ success, data }` envelope. */
suspend fun <T> apiCall(block: suspend () -> Response<ApiResponse<T>>): Result<T> {
    return try {
        val response = block()
        val body = response.body()
        when {
            !response.isSuccessful -> Result.failure(errorMessage(response))
            body?.data == null -> Result.failure(ApiException(translate(body?.message) ?: "پاسخ نامعتبر از سرور"))
            else -> Result.success(body.data)
        }
    } catch (e: CancellationException) {
        throw e
    } catch (e: Exception) {
        Result.failure(networkError(e))
    }
}

/** Runs a call whose response carries only a message. */
suspend fun apiCallUnit(block: suspend () -> Response<MessageResponse>): Result<Unit> {
    return try {
        val response = block()
        if (response.isSuccessful) Result.success(Unit) else Result.failure(errorMessage(response))
    } catch (e: CancellationException) {
        throw e
    } catch (e: Exception) {
        Result.failure(networkError(e))
    }
}
