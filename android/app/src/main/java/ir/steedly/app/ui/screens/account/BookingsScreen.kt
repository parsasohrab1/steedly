@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package ir.steedly.app.ui.screens.account

import android.content.Intent
import android.net.Uri
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import ir.steedly.app.data.model.Booking
import ir.steedly.app.data.model.BookingStatusRequest
import ir.steedly.app.data.model.ReviewRequest
import ir.steedly.app.data.model.ServiceType
import ir.steedly.app.data.remote.RetrofitClient
import ir.steedly.app.data.remote.apiCall
import ir.steedly.app.ui.components.*
import ir.steedly.app.ui.navigation.Routes
import ir.steedly.app.utils.StatusLabels
import ir.steedly.app.utils.formatJalaliDate
import kotlinx.coroutines.launch

@Composable
fun BookingsScreen(navController: NavController) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val snackbar = remember { SnackbarHostState() }
    var bookings by remember { mutableStateOf<List<Booking>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var reloadKey by remember { mutableIntStateOf(0) }
    var cancelTarget by remember { mutableStateOf<Booking?>(null) }
    var reviewTarget by remember { mutableStateOf<Booking?>(null) }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbar) },
        topBar = { AppTopBar("رزروهای من", onBack = { navController.popBackStack() }) }
    ) { padding ->
        RequireLogin(navController, Modifier.padding(padding)) {
            LaunchedEffect(reloadKey) {
                loading = bookings.isEmpty()
                error = null
                apiCall { RetrofitClient.apiService.getBookings() }
                    .onSuccess { bookings = it }
                    .onFailure { error = it.message }
                loading = false
            }
            when {
                loading -> LoadingView(Modifier.padding(padding))
                error != null && bookings.isEmpty() -> ErrorView(error!!, Modifier.padding(padding), onRetry = { reloadKey++ })
                bookings.isEmpty() -> EmptyView(
                    title = "رزروی ثبت نکرده‌اید",
                    icon = Icons.Default.CalendarToday,
                    modifier = Modifier.padding(padding),
                    actionLabel = "رزرو دامپزشک یا اسب‌کش",
                    onAction = { navController.navigate(Routes.SERVICES) { launchSingleTop = true } }
                )
                else -> LazyColumn(
                    modifier = Modifier.padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(bookings, key = { it.id }) { booking ->
                        Card(Modifier.fillMaxWidth()) {
                            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        if (booking.service_type == ServiceType.VETERINARIAN) Icons.Default.MedicalServices else Icons.Default.LocalShipping,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.primary
                                    )
                                    Spacer(Modifier.width(8.dp))
                                    Column(Modifier.weight(1f)) {
                                        Text(
                                            booking.provider_name ?: ServiceType.label(booking.service_type),
                                            fontWeight = FontWeight.Bold,
                                            modifier = Modifier.clickable {
                                                navController.navigate(Routes.provider(booking.service_type, booking.service_provider_id))
                                            }
                                        )
                                        Text(ServiceType.label(booking.service_type), style = MaterialTheme.typography.bodySmall)
                                    }
                                    StatusChip(StatusLabels.booking(booking.status), statusColor(booking.status))
                                }
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.Schedule, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(Modifier.width(4.dp))
                                    Text(formatJalaliDate(booking.booking_date, withTime = true), style = MaterialTheme.typography.bodyMedium)
                                }
                                booking.description?.takeIf { it.isNotBlank() }?.let {
                                    Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    booking.provider_phone?.let { phone ->
                                        TextButton(onClick = { context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:$phone"))) }) {
                                            Icon(Icons.Default.Call, contentDescription = null)
                                            Spacer(Modifier.width(4.dp))
                                            Text("تماس")
                                        }
                                    }
                                    if (booking.status == "pending" || booking.status == "confirmed") {
                                        TextButton(
                                            onClick = { cancelTarget = booking },
                                            colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                                        ) { Text("لغو رزرو") }
                                    }
                                    if (booking.status == "completed" && booking.has_review != true) {
                                        TextButton(onClick = { reviewTarget = booking }) {
                                            Icon(Icons.Default.RateReview, contentDescription = null)
                                            Spacer(Modifier.width(4.dp))
                                            Text("ثبت نظر")
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    cancelTarget?.let { booking ->
        AlertDialog(
            onDismissRequest = { cancelTarget = null },
            title = { Text("لغو رزرو") },
            text = { Text("آیا از لغو این رزرو مطمئن هستید؟") },
            confirmButton = {
                TextButton(onClick = {
                    cancelTarget = null
                    scope.launch {
                        apiCall { RetrofitClient.apiService.updateBookingStatus(booking.id, BookingStatusRequest("cancelled")) }
                            .onSuccess { snackbar.showSnackbar("رزرو لغو شد"); reloadKey++ }
                            .onFailure { snackbar.showSnackbar(it.message ?: "") }
                    }
                }) { Text("لغو رزرو") }
            },
            dismissButton = { TextButton(onClick = { cancelTarget = null }) { Text("انصراف") } }
        )
    }

    reviewTarget?.let { booking ->
        ReviewDialog(
            onDismiss = { reviewTarget = null },
            onSubmit = { rating, comment ->
                reviewTarget = null
                scope.launch {
                    apiCall {
                        RetrofitClient.apiService.createReview(
                            ReviewRequest(
                                booking_id = booking.id,
                                service_provider_id = booking.service_provider_id,
                                service_type = booking.service_type,
                                rating = rating,
                                comment = comment.ifBlank { null }
                            )
                        )
                    }.onSuccess { snackbar.showSnackbar("نظر شما ثبت شد"); reloadKey++ }
                        .onFailure { snackbar.showSnackbar(it.message ?: "") }
                }
            }
        )
    }
}

@Composable
private fun ReviewDialog(onDismiss: () -> Unit, onSubmit: (Int, String) -> Unit) {
    var rating by remember { mutableIntStateOf(5) }
    var comment by remember { mutableStateOf("") }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("امتیاز شما") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row {
                    (1..5).forEach { star ->
                        IconButton(onClick = { rating = star }) {
                            Icon(
                                if (star <= rating) Icons.Default.Star else Icons.Default.StarBorder,
                                contentDescription = "$star ستاره",
                                tint = Color(0xFFF59E0B)
                            )
                        }
                    }
                }
                OutlinedTextField(
                    value = comment,
                    onValueChange = { comment = it },
                    label = { Text("نظر شما (اختیاری)") },
                    minLines = 3,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = { TextButton(onClick = { onSubmit(rating, comment.trim()) }) { Text("ثبت") } },
        dismissButton = { TextButton(onClick = onDismiss) { Text("انصراف") } }
    )
}
