@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package ir.steedly.app.ui.screens.account

import android.content.Context
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import ir.steedly.app.data.model.Order
import ir.steedly.app.data.model.Payment
import ir.steedly.app.data.remote.RetrofitClient
import ir.steedly.app.data.remote.apiCall
import ir.steedly.app.ui.components.*
import ir.steedly.app.ui.navigation.Routes
import ir.steedly.app.ui.screens.shop.openInBrowser
import ir.steedly.app.utils.StatusLabels
import ir.steedly.app.utils.formatJalaliDate
import ir.steedly.app.utils.formatNumber
import ir.steedly.app.utils.formatToman
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.launch

fun Order.canPay() = status != "cancelled" && payment_status != "paid"

// Mirrors the backend rule in shopController.cancelOrder
fun Order.canCancel() = status == "pending" && payment_status != "paid"

/** Starts a Zarinpal payment and opens the gateway in the browser. */
suspend fun startPayment(context: Context, orderId: Int): Result<Unit> =
    apiCall { RetrofitClient.apiService.requestPayment(orderId) }
        .map { openInBrowser(context, it.payment_url) }

@Composable
fun OrdersScreen(navController: NavController) {
    var orders by remember { mutableStateOf<List<Order>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var reloadKey by remember { mutableIntStateOf(0) }

    Scaffold(topBar = { AppTopBar("My orders", onBack = { navController.popBackStack() }) }) { padding ->
        RequireLogin(navController, Modifier.padding(padding)) {
            LaunchedEffect(reloadKey) {
                loading = true
                error = null
                apiCall { RetrofitClient.apiService.getOrders() }
                    .onSuccess { orders = it }
                    .onFailure { error = it.message }
                loading = false
            }
            when {
                loading -> LoadingView(Modifier.padding(padding))
                error != null -> ErrorView(error!!, Modifier.padding(padding), onRetry = { reloadKey++ })
                orders.isEmpty() -> EmptyView(
                    title = "You have no orders",
                    icon = Icons.Default.ShoppingBag,
                    modifier = Modifier.padding(padding),
                    actionLabel = "Start shopping",
                    onAction = { navController.navigate(Routes.SHOP) { launchSingleTop = true } }
                )
                else -> LazyColumn(
                    modifier = Modifier.padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(orders, key = { it.id }) { order ->
                        Card(Modifier.fillMaxWidth().clickable { navController.navigate(Routes.order(order.id)) }) {
                            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text("Order #${order.order_number}", fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                                    StatusChip(StatusLabels.order(order.status), statusColor(order.status))
                                }
                                Text(formatJalaliDate(order.created_at, withTime = true), style = MaterialTheme.typography.bodySmall)
                                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text(StatusLabels.payment(order.payment_status), color = statusColor(order.payment_status))
                                    Text(formatToman(order.total_amount), fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun OrderDetailScreen(navController: NavController, orderId: Int) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val snackbar = remember { SnackbarHostState() }
    var order by remember { mutableStateOf<Order?>(null) }
    var payments by remember { mutableStateOf<List<Payment>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var confirmCancel by remember { mutableStateOf(false) }
    var reloadKey by remember { mutableIntStateOf(0) }

    // Coming back from the payment gateway in the browser: refresh the payment status
    val lifecycleOwner = LocalLifecycleOwner.current
    DisposableEffect(lifecycleOwner) {
        var firstResume = true
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                if (firstResume) firstResume = false else reloadKey++
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbar) },
        topBar = { AppTopBar("Order details", onBack = { navController.popBackStack() }) }
    ) { padding ->
        RequireLogin(navController, Modifier.padding(padding)) {
            LaunchedEffect(orderId, reloadKey) {
                loading = order == null
                error = null
                coroutineScope {
                    val orderJob = async { apiCall { RetrofitClient.apiService.getOrder(orderId) } }
                    val paymentsJob = async { apiCall { RetrofitClient.apiService.getOrderPayments(orderId) } }
                    orderJob.await().onSuccess { order = it }.onFailure { error = it.message }
                    paymentsJob.await().onSuccess { payments = it }
                }
                loading = false
            }

            val current = order
            when {
                loading -> LoadingView(Modifier.padding(padding))
                error != null && current == null -> ErrorView(error!!, Modifier.padding(padding), onRetry = { reloadKey++ })
                current != null -> LazyColumn(
                    modifier = Modifier.padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    item {
                        Card(Modifier.fillMaxWidth()) {
                            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text("Order #${current.order_number}", fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                                    StatusChip(StatusLabels.order(current.status), statusColor(current.status))
                                }
                                Text(formatJalaliDate(current.created_at, withTime = true), style = MaterialTheme.typography.bodySmall)
                                Divider()
                                LabeledValue("Payment status", StatusLabels.payment(current.payment_status))
                                LabeledValue("Payment method", if (current.payment_method == "cash") "Cash on delivery" else "Online payment")
                                current.shipping_address?.let { LabeledValue("Shipping address", it) }
                            }
                        }
                    }
                    item { SectionTitle("Order items") }
                    items(current.items.orEmpty(), key = { it.id ?: it.hashCode() }) { item ->
                        Card(Modifier.fillMaxWidth()) {
                            Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                RemoteImage(item.product_image, item.product_name, Modifier.size(56.dp))
                                Column(Modifier.weight(1f)) {
                                    Text(item.product_name ?: "Product", fontWeight = FontWeight.Medium)
                                    Text("${formatNumber(item.quantity)} × ${formatToman(item.price)}", style = MaterialTheme.typography.bodySmall)
                                }
                                Text(formatToman(item.price * item.quantity))
                            }
                        }
                    }
                    item {
                        Row(Modifier.fillMaxWidth().padding(vertical = 8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Total amount", fontWeight = FontWeight.Bold)
                            Text(formatToman(current.total_amount), fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                        }
                    }
                    if (payments.isNotEmpty()) {
                        item { SectionTitle("Transactions") }
                        items(payments, key = { "p${it.id}" }) { payment ->
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(formatJalaliDate(payment.created_at, withTime = true), style = MaterialTheme.typography.bodySmall)
                                Text(
                                    StatusLabels.payment(payment.status) + (payment.ref_id?.let { " — tracking code $it" } ?: ""),
                                    color = statusColor(payment.status),
                                    style = MaterialTheme.typography.bodySmall
                                )
                            }
                        }
                    }
                    item {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            if (current.canPay()) {
                                Button(
                                    onClick = {
                                        scope.launch {
                                            busy = true
                                            startPayment(context, current.id).onFailure { snackbar.showSnackbar(it.message ?: "") }
                                            busy = false
                                        }
                                    },
                                    enabled = !busy,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Icon(Icons.Default.CreditCard, contentDescription = null)
                                    Spacer(Modifier.width(6.dp))
                                    Text("Online payment")
                                }
                            }
                            if (current.canCancel()) {
                                OutlinedButton(
                                    onClick = { confirmCancel = true },
                                    enabled = !busy,
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error)
                                ) { Text("Cancel order") }
                            }
                            TextButton(onClick = { reloadKey++ }, modifier = Modifier.fillMaxWidth()) {
                                Icon(Icons.Default.Refresh, contentDescription = null)
                                Spacer(Modifier.width(6.dp))
                                Text("Update status")
                            }
                        }
                    }
                }
            }
        }
    }

    if (confirmCancel) {
        AlertDialog(
            onDismissRequest = { confirmCancel = false },
            title = { Text("Cancel order") },
            text = { Text("Are you sure you want to cancel this order?") },
            confirmButton = {
                TextButton(onClick = {
                    confirmCancel = false
                    scope.launch {
                        busy = true
                        apiCall { RetrofitClient.apiService.cancelOrder(orderId) }
                            .onSuccess {
                                snackbar.showSnackbar("Order cancelled")
                                reloadKey++
                            }
                            .onFailure { snackbar.showSnackbar(it.message ?: "") }
                        busy = false
                    }
                }) { Text("Cancel order") }
            },
            dismissButton = { TextButton(onClick = { confirmCancel = false }) { Text("Cancel") } }
        )
    }
}

@Composable
fun LabeledValue(label: String, value: String) {
    Column {
        Text(label, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value, style = MaterialTheme.typography.bodyMedium)
    }
}

@Composable
fun PaymentResultScreen(navController: NavController, orderId: Int, status: String, refId: String?) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val success = status == "success"
    var retryError by remember { mutableStateOf<String?>(null) }

    Scaffold(topBar = { AppTopBar("Payment result") }) { padding ->
        Column(
            Modifier.padding(padding).fillMaxSize().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                if (success) Icons.Default.CheckCircle else Icons.Default.Cancel,
                contentDescription = null,
                modifier = Modifier.size(96.dp),
                tint = if (success) statusColor("paid") else MaterialTheme.colorScheme.error
            )
            Spacer(Modifier.height(16.dp))
            Text(
                if (success) "Payment was successful" else "Payment failed",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
            Spacer(Modifier.height(8.dp))
            Text(
                if (success) "Your order is being processed." else "Your order has been placed and you can pay again.",
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            if (success && refId != null) {
                Spacer(Modifier.height(12.dp))
                Text("Tracking code: $refId", fontWeight = FontWeight.Medium)
            }
            retryError?.let {
                Spacer(Modifier.height(12.dp))
                ErrorBanner(it)
            }
            Spacer(Modifier.height(24.dp))
            if (!success) {
                Button(onClick = {
                    scope.launch { startPayment(context, orderId).onFailure { retryError = it.message } }
                }, modifier = Modifier.fillMaxWidth()) { Text("Retry payment") }
                Spacer(Modifier.height(8.dp))
            }
            OutlinedButton(
                onClick = { navController.navigate(Routes.order(orderId)) { popUpTo(Routes.HOME) } },
                modifier = Modifier.fillMaxWidth()
            ) { Text("View order") }
            TextButton(onClick = { navController.navigate(Routes.HOME) { popUpTo(Routes.HOME) { inclusive = true } } }) {
                Text("Back to home")
            }
        }
    }
}
