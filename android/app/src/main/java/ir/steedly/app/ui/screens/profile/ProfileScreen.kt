@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package ir.steedly.app.ui.screens.profile

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import ir.steedly.app.ui.components.*
import ir.steedly.app.ui.navigation.Routes
import ir.steedly.app.utils.formatJalaliLong

@Composable
fun ProfileScreen(
    navController: NavController,
    viewModel: ProfileViewModel = viewModel()
) {
    val context = LocalContext.current
    val profile by viewModel.profile.collectAsState()
    val loading by viewModel.loading.collectAsState()
    val busy by viewModel.busy.collectAsState()
    val error by viewModel.error.collectAsState()
    val message by viewModel.message.collectAsState()
    val snackbar = remember { SnackbarHostState() }

    var editing by remember { mutableStateOf(false) }
    var fullName by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var showLogoutDialog by remember { mutableStateOf(false) }

    val avatarPicker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        if (uri != null) viewModel.uploadAvatar(context, uri)
    }

    LaunchedEffect(Unit) { viewModel.loadProfile() }
    LaunchedEffect(message) {
        message?.let {
            snackbar.showSnackbar(it)
            viewModel.consumeMessage()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbar) },
        topBar = {
            AppTopBar("پروفایل کاربری", onBack = { navController.popBackStack() }, actions = {
                IconButton(onClick = { navController.navigate(Routes.SETTINGS) }) {
                    Icon(Icons.Default.Settings, contentDescription = "تنظیمات")
                }
            })
        }
    ) { padding ->
        RequireLogin(navController, Modifier.padding(padding)) {
            val user = profile
            when {
                loading && user == null -> LoadingView(Modifier.padding(padding))
                error != null && user == null -> ErrorView(error!!, Modifier.padding(padding), onRetry = viewModel::loadProfile)
                user != null -> Column(
                    modifier = Modifier
                        .padding(padding)
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Box(contentAlignment = Alignment.BottomEnd) {
                        val avatarModifier = Modifier
                            .size(112.dp)
                            .clip(CircleShape)
                            .clickable(enabled = !busy) {
                                avatarPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
                            }
                        if (user.avatar_url != null) {
                            RemoteImage(user.avatar_url, "تصویر پروفایل", avatarModifier)
                        } else {
                            Surface(modifier = avatarModifier, color = MaterialTheme.colorScheme.primaryContainer) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(Icons.Default.Person, contentDescription = null, modifier = Modifier.size(64.dp), tint = MaterialTheme.colorScheme.onPrimaryContainer)
                                }
                            }
                        }
                        Surface(shape = CircleShape, color = MaterialTheme.colorScheme.primary, modifier = Modifier.size(32.dp)) {
                            Box(contentAlignment = Alignment.Center) {
                                if (busy) CircularProgressIndicator(Modifier.size(16.dp), color = MaterialTheme.colorScheme.onPrimary, strokeWidth = 2.dp)
                                else Icon(Icons.Default.PhotoCamera, contentDescription = "تغییر تصویر", tint = MaterialTheme.colorScheme.onPrimary, modifier = Modifier.size(18.dp))
                            }
                        }
                    }
                    Text(user.full_name ?: user.email, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                    user.created_at?.let {
                        Text("عضو از ${formatJalaliLong(it)}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }

                    Card(Modifier.fillMaxWidth()) {
                        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            if (editing) {
                                OutlinedTextField(
                                    value = fullName,
                                    onValueChange = { fullName = it },
                                    label = { Text("نام کامل") },
                                    modifier = Modifier.fillMaxWidth(),
                                    singleLine = true
                                )
                                OutlinedTextField(
                                    value = phone,
                                    onValueChange = { phone = it },
                                    label = { Text("شماره موبایل") },
                                    modifier = Modifier.fillMaxWidth(),
                                    singleLine = true,
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
                                )
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Button(
                                        onClick = { viewModel.saveProfile(fullName, phone) { editing = false } },
                                        enabled = !busy && fullName.isNotBlank(),
                                        modifier = Modifier.weight(1f)
                                    ) { Text("ذخیره") }
                                    OutlinedButton(onClick = { editing = false }, modifier = Modifier.weight(1f)) { Text("انصراف") }
                                }
                            } else {
                                ProfileRow(Icons.Default.Email, "ایمیل", user.email)
                                ProfileRow(Icons.Default.Person, "نام کامل", user.full_name ?: "تعریف نشده")
                                ProfileRow(Icons.Default.Phone, "شماره تماس", user.phone ?: "تعریف نشده")
                                TextButton(onClick = {
                                    fullName = user.full_name.orEmpty()
                                    phone = user.phone.orEmpty()
                                    editing = true
                                }) {
                                    Icon(Icons.Default.Edit, contentDescription = null)
                                    Spacer(Modifier.width(6.dp))
                                    Text("ویرایش اطلاعات")
                                }
                            }
                        }
                    }

                    Card(Modifier.fillMaxWidth()) {
                        Column {
                            NavRow(Icons.Default.ShoppingBag, "سفارش‌های من") { navController.navigate(Routes.ORDERS) }
                            Divider()
                            NavRow(Icons.Default.CalendarToday, "رزروهای من") { navController.navigate(Routes.BOOKINGS) }
                            Divider()
                            NavRow(Icons.Default.Notifications, "اعلان‌ها") { navController.navigate(Routes.NOTIFICATIONS) }
                            Divider()
                            NavRow(Icons.Default.Settings, "تنظیمات") { navController.navigate(Routes.SETTINGS) }
                        }
                    }

                    OutlinedButton(
                        onClick = { showLogoutDialog = true },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error)
                    ) {
                        Icon(Icons.Default.Logout, contentDescription = null)
                        Spacer(Modifier.width(6.dp))
                        Text("خروج از حساب")
                    }
                }
            }
        }
    }

    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = { Text("خروج از حساب کاربری") },
            text = { Text("آیا مطمئن هستید که می‌خواهید خارج شوید؟") },
            confirmButton = {
                TextButton(onClick = {
                    showLogoutDialog = false
                    viewModel.logout {
                        navController.navigate(Routes.HOME) { popUpTo(0) }
                    }
                }) { Text("خروج") }
            },
            dismissButton = { TextButton(onClick = { showLogoutDialog = false }) { Text("انصراف") } }
        )
    }
}

@Composable
private fun ProfileRow(icon: ImageVector, label: String, value: String) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
        Column {
            Text(label, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(value, style = MaterialTheme.typography.bodyLarge)
        }
    }
}

@Composable
private fun NavRow(icon: ImageVector, title: String, onClick: () -> Unit) {
    ListItem(
        modifier = Modifier.clickable(onClick = onClick),
        leadingContent = { Icon(icon, contentDescription = null) },
        headlineContent = { Text(title) },
        trailingContent = { Icon(Icons.Default.ChevronLeft, contentDescription = null) }
    )
}
