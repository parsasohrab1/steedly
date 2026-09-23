@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package ir.steedly.app.ui.screens.settings

import android.content.Context
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.imageLoader
import ir.steedly.app.BuildConfig
import ir.steedly.app.data.remote.RetrofitClient
import ir.steedly.app.data.local.SettingsManager
import ir.steedly.app.repository.OfflineRepository
import ir.steedly.app.ui.components.AppTopBar
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class SettingsViewModel : ViewModel() {
    val darkModeAuto = SettingsManager.getDarkModeAuto()
    val darkModeManual = SettingsManager.getDarkMode()
    val offlineMode = SettingsManager.getOfflineMode()
    val notifications = SettingsManager.getNotificationsEnabled()

    suspend fun setDarkModeAuto(enabled: Boolean) = SettingsManager.setDarkModeAuto(enabled)
    suspend fun setDarkMode(enabled: Boolean) = SettingsManager.setDarkMode(enabled)
    suspend fun setOfflineMode(enabled: Boolean) = SettingsManager.setOfflineMode(enabled)
    suspend fun setNotifications(enabled: Boolean) = SettingsManager.setNotificationsEnabled(enabled)

    @OptIn(coil.annotation.ExperimentalCoilApi::class)
    suspend fun clearCache(context: Context) {
        OfflineRepository.get(context).clearAll()
        context.imageLoader.memoryCache?.clear()
        withContext(Dispatchers.IO) { context.imageLoader.diskCache?.clear() }
    }
}

@Composable
fun SettingsScreen(
    navController: NavController,
    viewModel: SettingsViewModel = viewModel()
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val snackbar = remember { SnackbarHostState() }
    val darkModeAuto by viewModel.darkModeAuto.collectAsState(initial = true)
    val darkModeManual by viewModel.darkModeManual.collectAsState(initial = false)
    val offlineMode by viewModel.offlineMode.collectAsState(initial = true)
    val notifications by viewModel.notifications.collectAsState(initial = true)

    Scaffold(
        snackbarHost = { SnackbarHost(snackbar) },
        topBar = { AppTopBar("تنظیمات", onBack = { navController.popBackStack() }) }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            SettingsCard("ظاهر") {
                SwitchRow("حالت تاریک خودکار", "پیروی از تنظیمات سیستم", darkModeAuto) {
                    scope.launch { viewModel.setDarkModeAuto(it) }
                }
                if (!darkModeAuto) {
                    SwitchRow("حالت تاریک", null, darkModeManual) {
                        scope.launch { viewModel.setDarkMode(it) }
                    }
                }
            }

            if (BuildConfig.DEBUG) {
                ServerAddressCard(snackbar)
            }

            SettingsCard("اعلان‌ها") {
                SwitchRow("اعلان سفارش‌ها و رزروها", "نمایش اعلان هنگام تغییر وضعیت سفارش یا رزرو", notifications) {
                    scope.launch { viewModel.setNotifications(it) }
                }
            }

            SettingsCard("داده و ذخیره‌سازی") {
                SwitchRow("حالت آفلاین", "ذخیره مقالات، محصولات و مسابقات برای مشاهده بدون اینترنت", offlineMode) {
                    scope.launch { viewModel.setOfflineMode(it) }
                }
                Divider()
                TextButton(
                    onClick = {
                        scope.launch {
                            viewModel.clearCache(context)
                            snackbar.showSnackbar("حافظه موقت پاک شد")
                        }
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.Delete, contentDescription = null)
                    Spacer(Modifier.width(8.dp))
                    Text("پاک کردن حافظه موقت")
                }
            }

            SettingsCard("درباره") {
                Text("استیدلی (Steedly) — سلامت و مراقبت اسب", style = MaterialTheme.typography.bodyLarge)
                Text(
                    "نسخه ${BuildConfig.VERSION_NAME}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
private fun SettingsCard(title: String, content: @Composable ColumnScope.() -> Unit) {
    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(title, style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
            content()
        }
    }
}

@Composable
private fun SwitchRow(title: String, subtitle: String?, checked: Boolean, onChange: (Boolean) -> Unit) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.bodyLarge)
            subtitle?.let {
                Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
        Switch(checked = checked, onCheckedChange = onChange)
    }
}

/**
 * Debug builds only: choose which backend the app talks to, e.g. the IP of the
 * computer running `npm run dev` on the same Wi-Fi network.
 */
@Composable
private fun ServerAddressCard(snackbar: SnackbarHostState) {
    val scope = rememberCoroutineScope()
    var input by remember { mutableStateOf(RetrofitClient.baseUrl) }
    var current by remember { mutableStateOf(RetrofitClient.baseUrl) }
    var busy by remember { mutableStateOf(false) }

    SettingsCard("آدرس سرور (نسخه آزمایشی)") {
        Text(
            "IP کامپیوتری که بک‌اند روی آن اجرا می‌شود را وارد کنید. گوشی و کامپیوتر باید به یک شبکه Wi-Fi وصل باشند.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        OutlinedTextField(
            value = input,
            onValueChange = { input = it },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("آدرس سرور") },
            placeholder = { Text("192.168.1.10:3000") },
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Uri)
        )
        Text(
            "در حال استفاده: $current",
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(
                enabled = !busy,
                onClick = {
                    val url = RetrofitClient.normalizeBaseUrl(input)
                    if (url == null) {
                        scope.launch { snackbar.showSnackbar("آدرس نامعتبر است") }
                        return@OutlinedButton
                    }
                    scope.launch {
                        busy = true
                        val ok = RetrofitClient.checkHealth(url)
                        busy = false
                        snackbar.showSnackbar(if (ok) "اتصال برقرار است ✓" else "سرور پاسخ نداد: $url")
                    }
                }
            ) { Text("تست اتصال") }
            Button(
                enabled = !busy,
                onClick = {
                    val url = RetrofitClient.normalizeBaseUrl(input)
                    if (url == null) {
                        scope.launch { snackbar.showSnackbar("آدرس نامعتبر است") }
                        return@Button
                    }
                    scope.launch {
                        SettingsManager.setServerUrl(url)
                        RetrofitClient.setBaseUrl(url)
                        input = url
                        current = url
                        snackbar.showSnackbar("آدرس سرور ذخیره شد")
                    }
                }
            ) { Text("ذخیره") }
        }
        TextButton(
            enabled = !busy,
            onClick = {
                scope.launch {
                    SettingsManager.setServerUrl(null)
                    RetrofitClient.setBaseUrl(RetrofitClient.DEFAULT_BASE_URL)
                    input = RetrofitClient.DEFAULT_BASE_URL
                    current = RetrofitClient.DEFAULT_BASE_URL
                }
            }
        ) { Text("بازگشت به آدرس پیش‌فرض") }
    }
}
