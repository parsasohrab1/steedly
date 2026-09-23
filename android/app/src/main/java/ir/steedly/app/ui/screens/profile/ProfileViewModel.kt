package ir.steedly.app.ui.screens.profile

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import ir.steedly.app.data.local.TokenManager
import ir.steedly.app.data.model.UpdateProfileRequest
import ir.steedly.app.data.model.User
import ir.steedly.app.data.remote.RetrofitClient
import ir.steedly.app.data.remote.apiCall
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody

class ProfileViewModel : ViewModel() {
    private val _profile = MutableStateFlow<User?>(null)
    val profile: StateFlow<User?> = _profile.asStateFlow()

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    private val _busy = MutableStateFlow(false)
    val busy: StateFlow<Boolean> = _busy.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _message = MutableStateFlow<String?>(null)
    val message: StateFlow<String?> = _message.asStateFlow()

    fun loadProfile() {
        viewModelScope.launch {
            _loading.value = true
            _error.value = null
            apiCall { RetrofitClient.apiService.getProfile() }
                .onSuccess { _profile.value = it }
                .onFailure { _error.value = it.message }
            _loading.value = false
        }
    }

    fun saveProfile(fullName: String, phone: String, onDone: () -> Unit) {
        viewModelScope.launch {
            _busy.value = true
            apiCall {
                RetrofitClient.apiService.updateProfile(
                    UpdateProfileRequest(full_name = fullName.trim(), phone = phone.trim())
                )
            }.onSuccess {
                _profile.value = _profile.value?.copy(full_name = it.full_name, phone = it.phone) ?: it
                _message.value = "اطلاعات ذخیره شد"
                onDone()
            }.onFailure { _message.value = it.message }
            _busy.value = false
        }
    }

    /** Uploads the picked image, then stores its URL on the profile. */
    fun uploadAvatar(context: Context, uri: Uri) {
        viewModelScope.launch {
            _busy.value = true
            val part = withContext(Dispatchers.IO) {
                val resolver = context.contentResolver
                val mime = resolver.getType(uri) ?: "image/jpeg"
                val bytes = resolver.openInputStream(uri)?.use { it.readBytes() }
                bytes?.let {
                    val extension = mime.substringAfter("/", "jpg")
                    MultipartBody.Part.createFormData(
                        "avatar",
                        "avatar.$extension",
                        it.toRequestBody(mime.toMediaTypeOrNull())
                    )
                }
            }
            if (part == null) {
                _message.value = "خواندن تصویر ممکن نشد"
                _busy.value = false
                return@launch
            }
            if (part.body.contentLength() > 5 * 1024 * 1024) {
                _message.value = "حجم تصویر باید کمتر از ۵ مگابایت باشد"
                _busy.value = false
                return@launch
            }
            apiCall { RetrofitClient.apiService.uploadAvatar(part) }
                .onSuccess { upload ->
                    apiCall { RetrofitClient.apiService.updateProfile(UpdateProfileRequest(avatar_url = upload.url)) }
                        .onSuccess {
                            _profile.value = _profile.value?.copy(avatar_url = upload.url)
                            _message.value = "تصویر پروفایل به‌روز شد"
                        }
                        .onFailure { _message.value = it.message }
                }
                .onFailure { _message.value = it.message }
            _busy.value = false
        }
    }

    fun consumeMessage() {
        _message.value = null
    }

    fun logout(onDone: () -> Unit) {
        viewModelScope.launch {
            TokenManager.clearToken()
            onDone()
        }
    }
}
