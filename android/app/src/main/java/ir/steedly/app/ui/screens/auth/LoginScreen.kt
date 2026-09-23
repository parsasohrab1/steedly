@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package ir.steedly.app.ui.screens.auth

import android.util.Patterns
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import ir.steedly.app.R
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import ir.steedly.app.data.local.SettingsManager
import ir.steedly.app.data.local.TokenManager
import ir.steedly.app.data.model.LoginRequest
import ir.steedly.app.data.model.RegisterRequest
import ir.steedly.app.data.remote.RetrofitClient
import ir.steedly.app.data.remote.apiCall
import ir.steedly.app.ui.components.AppTopBar
import ir.steedly.app.ui.components.ErrorBanner
import ir.steedly.app.ui.navigation.Routes
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(navController: NavController) {
    val scope = rememberCoroutineScope()
    var isRegister by remember { mutableStateOf(false) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var fullName by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    fun validate(): String? = when {
        !Patterns.EMAIL_ADDRESS.matcher(email.trim()).matches() -> "ایمیل معتبر وارد کنید"
        password.length < 6 -> "رمز عبور باید حداقل ۶ کاراکتر باشد"
        isRegister && fullName.isBlank() -> "نام کامل الزامی است"
        else -> null
    }

    fun submit() {
        validate()?.let { error = it; return }
        scope.launch {
            loading = true
            error = null
            val result = if (isRegister) {
                apiCall {
                    RetrofitClient.apiService.register(
                        RegisterRequest(
                            email = email.trim(),
                            password = password,
                            full_name = fullName.trim(),
                            phone = phone.trim().ifBlank { null }
                        )
                    )
                }
            } else {
                apiCall { RetrofitClient.apiService.login(LoginRequest(email.trim(), password)) }
            }
            result.onSuccess { auth ->
                TokenManager.saveSession(auth.token, auth.user.id)
                // Don't replay notifications that existed before this login
                SettingsManager.setLastNotifiedId(0)
                // Return to where the user was (cart, booking, ...) or home
                if (!navController.popBackStack()) {
                    navController.navigate(Routes.HOME) { popUpTo(0) }
                }
            }.onFailure { error = it.message }
            loading = false
        }
    }

    Scaffold(topBar = { AppTopBar(if (isRegister) "ثبت‌نام" else "ورود", onBack = { navController.popBackStack() }) }) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Surface(shape = RoundedCornerShape(20.dp), color = MaterialTheme.colorScheme.primary, modifier = Modifier.size(84.dp)) {
                Image(painterResource(R.drawable.ic_launcher_foreground), contentDescription = "استیدلی", modifier = Modifier.fillMaxSize())
            }
            Text(
                if (isRegister) "ایجاد حساب کاربری جدید" else "به استیدلی خوش آمدید",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )

            if (isRegister) {
                OutlinedTextField(
                    value = fullName,
                    onValueChange = { fullName = it },
                    label = { Text("نام کامل") },
                    leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next)
                )
            }

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("ایمیل") },
                leadingIcon = { Icon(Icons.Default.Email, contentDescription = null) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next)
            )

            if (isRegister) {
                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = { Text("شماره موبایل (اختیاری)") },
                    leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone, imeAction = ImeAction.Next)
                )
            }

            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("رمز عبور") },
                leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
                trailingIcon = {
                    IconButton(onClick = { showPassword = !showPassword }) {
                        Icon(
                            if (showPassword) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = if (showPassword) "پنهان کردن رمز" else "نمایش رمز"
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done)
            )

            error?.let { ErrorBanner(it) }

            Button(
                onClick = ::submit,
                enabled = !loading,
                modifier = Modifier.fillMaxWidth().height(52.dp)
            ) {
                if (loading) {
                    CircularProgressIndicator(Modifier.size(20.dp), color = MaterialTheme.colorScheme.onPrimary)
                } else {
                    Text(if (isRegister) "ثبت‌نام" else "ورود")
                }
            }

            if (!isRegister) {
                TextButton(onClick = { navController.navigate(Routes.FORGOT_PASSWORD) }) {
                    Text("رمز عبور را فراموش کرده‌اید؟")
                }
            }

            TextButton(onClick = { isRegister = !isRegister; error = null }) {
                Text(if (isRegister) "حساب کاربری دارید؟ وارد شوید" else "حساب کاربری ندارید؟ ثبت‌نام کنید")
            }
        }
    }
}
