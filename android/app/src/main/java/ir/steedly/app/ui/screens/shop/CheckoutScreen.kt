@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package ir.steedly.app.ui.screens.shop

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import ir.steedly.app.data.local.CartManager
import ir.steedly.app.data.model.OrderItemRequest
import ir.steedly.app.data.model.OrderRequest
import ir.steedly.app.data.remote.RetrofitClient
import ir.steedly.app.data.remote.apiCall
import ir.steedly.app.ui.components.AppTopBar
import ir.steedly.app.ui.components.ErrorBanner
import ir.steedly.app.ui.components.RequireLogin
import ir.steedly.app.ui.navigation.Routes
import ir.steedly.app.utils.formatNumber
import ir.steedly.app.utils.formatToman
import kotlinx.coroutines.launch

private val IRAN_MOBILE = Regex("^(\\+98|0)?9\\d{9}$")

/** Opens the payment gateway page in the user's browser. */
fun openInBrowser(context: android.content.Context, url: String) {
    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    context.startActivity(intent)
}

@Composable
fun CheckoutScreen(navController: NavController) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val cartItems by CartManager.items.collectAsState()

    var address by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var paymentMethod by remember { mutableStateOf("online") }
    var submitting by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    // Prefill the phone number from the profile
    LaunchedEffect(Unit) {
        apiCall { RetrofitClient.apiService.getProfile() }.onSuccess { user ->
            if (phone.isBlank()) phone = user.phone.orEmpty()
        }
    }

    val total = cartItems.sumOf { it.price * it.quantity }

    fun submit() {
        val normalizedPhone = phone.trim().replace(" ", "")
        when {
            address.trim().length < 10 -> { error = "لطفاً آدرس کامل را وارد کنید"; return }
            !IRAN_MOBILE.matches(normalizedPhone) -> { error = "شماره موبایل معتبر وارد کنید"; return }
        }
        scope.launch {
            submitting = true
            error = null
            val request = OrderRequest(
                items = cartItems.map { OrderItemRequest(it.productId, it.quantity) },
                shipping_address = "${address.trim()}\nتلفن: $normalizedPhone",
                payment_method = paymentMethod
            )
            apiCall { RetrofitClient.apiService.createOrder(request) }
                .onSuccess { order ->
                    // Stock is reserved server-side once the order exists
                    CartManager.clear()
                    val orderRoute = Routes.order(order.id)
                    if (paymentMethod == "online") {
                        apiCall { RetrofitClient.apiService.requestPayment(order.id) }
                            .onSuccess { payment -> openInBrowser(context, payment.payment_url) }
                    }
                    // The order page offers "pay again" if the user returns without paying
                    navController.navigate(orderRoute) {
                        popUpTo(Routes.CART) { inclusive = true }
                    }
                }
                .onFailure { error = it.message }
            submitting = false
        }
    }

    Scaffold(topBar = { AppTopBar("تکمیل خرید", onBack = { navController.popBackStack() }) }) { padding ->
        RequireLogin(navController, Modifier.padding(padding), "برای ثبت سفارش وارد حساب کاربری شوید") {
            Column(
                modifier = Modifier
                    .padding(padding)
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("اطلاعات ارسال", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        OutlinedTextField(
                            value = address,
                            onValueChange = { address = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("آدرس کامل") },
                            minLines = 3,
                            maxLines = 5
                        )
                        OutlinedTextField(
                            value = phone,
                            onValueChange = { phone = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("شماره موبایل") },
                            placeholder = { Text("09123456789") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
                        )
                    }
                }

                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(16.dp)) {
                        Text("روش پرداخت", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        PaymentOption("پرداخت آنلاین", "درگاه امن زرین‌پال", paymentMethod == "online") { paymentMethod = "online" }
                        PaymentOption("پرداخت در محل", "پرداخت هنگام تحویل", paymentMethod == "cash") { paymentMethod = "cash" }
                    }
                }

                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("خلاصه سفارش", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        cartItems.forEach { item ->
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("${item.name} × ${formatNumber(item.quantity)}", modifier = Modifier.weight(1f))
                                Text(formatToman(item.price * item.quantity))
                            }
                        }
                        Divider()
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("مبلغ قابل پرداخت", fontWeight = FontWeight.Bold)
                            Text(formatToman(total), fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        }
                    }
                }

                error?.let { ErrorBanner(it) }

                Button(
                    onClick = ::submit,
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    enabled = !submitting && cartItems.isNotEmpty()
                ) {
                    if (submitting) {
                        CircularProgressIndicator(Modifier.size(20.dp), color = MaterialTheme.colorScheme.onPrimary)
                    } else {
                        Icon(Icons.Default.Lock, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text(if (paymentMethod == "online") "ثبت سفارش و پرداخت" else "ثبت سفارش")
                    }
                }
            }
        }
    }
}

@Composable
private fun PaymentOption(title: String, subtitle: String, selected: Boolean, onSelect: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .selectable(selected = selected, onClick = onSelect)
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        RadioButton(selected = selected, onClick = onSelect)
        Column {
            Text(title)
            Text(subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}
