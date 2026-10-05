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
    "Invalid credentials" to "Incorrect email or password",
    "User already exists" to "A user with this email has already registered",
    "Account is deactivated" to "Your account has been deactivated",
    "Authentication required" to "Please log in to your account",
    "Invalid token" to "Your session has expired, please log in again",
    "Insufficient permissions" to "You do not have the required access",
    "Please provide a valid email" to "Enter a valid email",
    "Password must be at least 6 characters" to "Password must be at least 6 characters",
    "Full name is required" to "Full name is required",
    "Order is already paid" to "This order has already been paid",
    "Order is cancelled" to "This order has been cancelled",
    "Only unpaid pending orders can be cancelled" to "Only unpaid pending orders can be cancelled",
    "Order not found" to "Order not found",
    "Booking not found" to "Booking not found",
    "Post not found" to "Article not found",
    "Competition not found" to "Competition not found",
    "Only completed bookings can be reviewed" to "You can only submit a review for completed bookings",
    "This booking has already been reviewed" to "You have already submitted a review for this booking"
)

private fun translate(message: String?): String? {
    if (message.isNullOrBlank()) return null
    knownMessages[message]?.let { return it }
    return when {
        message.startsWith("Insufficient stock for") ->
            "Insufficient stock: " + message.removePrefix("Insufficient stock for").trim()
        message.startsWith("Payment gateway error") -> "Error connecting to the payment gateway"
        message.startsWith("Booking is already") -> "The status of this booking cannot be changed"
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
        401 -> "Please log in to your account"
        403 -> "You do not have the required access"
        404 -> "Requested item not found"
        in 500..599 -> "Server error, please try again later"
        else -> "Unknown error (${response.code()})"
    }
    return ApiException(translate(serverMessage) ?: fallback, response.code())
}

private fun networkError(e: Exception): ApiException = when (e) {
    is ApiException -> e
    is IOException -> ApiException("No internet connection")
    else -> ApiException("Error: ${e.message ?: e.javaClass.simpleName}")
}

/** Runs a call that returns the standard `{ success, data }` envelope. */
suspend fun <T> apiCall(block: suspend () -> Response<ApiResponse<T>>): Result<T> {
    return try {
        val response = block()
        val body = response.body()
        when {
            !response.isSuccessful -> Result.failure(errorMessage(response))
            body?.data == null -> Result.failure(ApiException(translate(body?.message) ?: "Invalid response from server"))
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
