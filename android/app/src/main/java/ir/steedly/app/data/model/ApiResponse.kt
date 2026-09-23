package ir.steedly.app.data.model

/** Envelope every backend endpoint uses: { success, message?, data } */
data class ApiResponse<T>(
    val success: Boolean,
    val message: String? = null,
    val data: T?
)

/** Envelope for endpoints that return no payload (e.g. mark-as-read). */
data class MessageResponse(
    val success: Boolean,
    val message: String? = null
)
