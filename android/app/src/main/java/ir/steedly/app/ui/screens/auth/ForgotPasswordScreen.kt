@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package ir.steedly.app.ui.screens.auth

import android.util.Patterns
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.MarkEmailRead
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import ir.steedly.app.data.model.ForgotPasswordRequest
import ir.steedly.app.data.remote.RetrofitClient
import ir.steedly.app.data.remote.apiCallUnit
import ir.steedly.app.ui.components.AppTopBar
import ir.steedly.app.ui.components.EmptyView
import ir.steedly.app.ui.components.ErrorBanner
import kotlinx.coroutines.launch

@Composable
fun ForgotPasswordScreen(navController: NavController) {
    val scope = rememberCoroutineScope()
    var email by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var sent by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    Scaffold(topBar = { AppTopBar("بازیابی رمز عبور", onBack = { navController.popBackStack() }) }) { padding ->
        if (sent) {
            EmptyView(
                title = "ایمیل بازیابی ارسال شد",
                subtitle = "اگر این ایمیل در سیستم ثبت شده باشد، لینک تغییر رمز عبور برای شما ارسال شده است.",
                icon = Icons.Default.MarkEmailRead,
                modifier = Modifier.padding(padding),
                actionLabel = "بازگشت به ورود",
                onAction = { navController.popBackStack() }
            )
        } else Column(
            Modifier.padding(padding).fillMaxSize().padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text("ایمیل حساب کاربری خود را وارد کنید تا لینک تغییر رمز عبور برایتان ارسال شود.")
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("ایمیل") },
                leadingIcon = { Icon(Icons.Default.Email, contentDescription = null) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
            )
            error?.let { ErrorBanner(it) }
            Button(
                onClick = {
                    if (!Patterns.EMAIL_ADDRESS.matcher(email.trim()).matches()) {
                        error = "ایمیل معتبر وارد کنید"
                        return@Button
                    }
                    scope.launch {
                        loading = true
                        error = null
                        apiCallUnit { RetrofitClient.apiService.forgotPassword(ForgotPasswordRequest(email.trim())) }
                            .onSuccess { sent = true }
                            .onFailure { error = it.message }
                        loading = false
                    }
                },
                enabled = !loading,
                modifier = Modifier.fillMaxWidth().height(52.dp)
            ) {
                if (loading) CircularProgressIndicator(Modifier.size(20.dp), color = MaterialTheme.colorScheme.onPrimary)
                else Text("ارسال لینک بازیابی")
            }
        }
    }
}
