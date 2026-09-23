@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package ir.steedly.app.ui.screens.services

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import ir.steedly.app.data.local.TokenManager
import ir.steedly.app.data.model.Review
import ir.steedly.app.data.model.ServiceProvider
import ir.steedly.app.data.model.ServiceType
import ir.steedly.app.data.model.toProvider
import ir.steedly.app.data.remote.RetrofitClient
import ir.steedly.app.data.remote.apiCall
import ir.steedly.app.ui.components.*
import ir.steedly.app.ui.navigation.Routes
import ir.steedly.app.utils.formatJalaliDate
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope

suspend fun loadProvider(type: String, id: Int): Result<ServiceProvider> =
    if (type == ServiceType.VETERINARIAN) {
        apiCall { RetrofitClient.apiService.getVeterinarian(id) }.map { it.toProvider() }
    } else {
        apiCall { RetrofitClient.apiService.getTransporter(id) }.map { it.toProvider() }
    }

@Composable
fun ProviderDetailScreen(navController: NavController, serviceType: String, providerId: Int) {
    val context = LocalContext.current
    val token by TokenManager.token.collectAsState()
    var provider by remember { mutableStateOf<ServiceProvider?>(null) }
    var reviews by remember { mutableStateOf<List<Review>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var reloadKey by remember { mutableIntStateOf(0) }

    LaunchedEffect(serviceType, providerId, reloadKey) {
        loading = true
        error = null
        coroutineScope {
            val providerJob = async { loadProvider(serviceType, providerId) }
            val reviewsJob = async { apiCall { RetrofitClient.apiService.getReviews(serviceType, providerId) } }
            providerJob.await().onSuccess { provider = it }.onFailure { error = it.message }
            reviewsJob.await().onSuccess { reviews = it }
        }
        loading = false
    }

    Scaffold(
        topBar = { AppTopBar(ServiceType.label(serviceType), onBack = { navController.popBackStack() }) },
        bottomBar = {
            provider?.let { p ->
                Surface(shadowElevation = 8.dp) {
                    Row(
                        Modifier.fillMaxWidth().padding(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        OutlinedButton(
                            onClick = { context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:${p.phone}"))) },
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.Call, contentDescription = null)
                            Spacer(Modifier.width(6.dp))
                            Text("تماس")
                        }
                        Button(
                            onClick = {
                                navController.navigate(if (token != null) Routes.booking(p.type, p.id) else Routes.LOGIN)
                            },
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.EventAvailable, contentDescription = null)
                            Spacer(Modifier.width(6.dp))
                            Text("رزرو نوبت")
                        }
                    }
                }
            }
        }
    ) { padding ->
        val current = provider
        when {
            loading -> LoadingView(Modifier.padding(padding))
            error != null -> ErrorView(error!!, Modifier.padding(padding), onRetry = { reloadKey++ })
            current != null -> LazyColumn(
                modifier = Modifier.padding(padding).fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                        if (current.imageUrl != null) {
                            RemoteImage(current.imageUrl, current.title, Modifier.size(96.dp).clip(CircleShape))
                        } else {
                            Surface(shape = CircleShape, color = MaterialTheme.colorScheme.primaryContainer, modifier = Modifier.size(96.dp)) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(
                                        if (current.type == ServiceType.VETERINARIAN) Icons.Default.MedicalServices else Icons.Default.LocalShipping,
                                        contentDescription = null,
                                        modifier = Modifier.size(48.dp),
                                        tint = MaterialTheme.colorScheme.onPrimaryContainer
                                    )
                                }
                            }
                        }
                        Spacer(Modifier.height(12.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(current.title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                            if (current.isVerified) {
                                Spacer(Modifier.width(6.dp))
                                Icon(Icons.Default.Verified, contentDescription = "تأیید شده", tint = MaterialTheme.colorScheme.primary)
                            }
                        }
                        current.subtitle?.let { Text(it, color = MaterialTheme.colorScheme.onSurfaceVariant) }
                        Spacer(Modifier.height(4.dp))
                        RatingRow(current.rating, current.totalReviews)
                    }
                }

                item {
                    Card(Modifier.fillMaxWidth()) {
                        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            InfoLine(Icons.Default.Phone, "تلفن", current.phone)
                            current.region?.let { InfoLine(Icons.Default.Place, "منطقه", it) }
                            current.address?.let { InfoLine(Icons.Default.Home, "آدرس", it) }
                            current.details.forEach { (label, value) -> InfoLine(Icons.Default.Info, label, value) }
                        }
                    }
                }

                if (current.latitude != null && current.longitude != null) {
                    item {
                        OutlinedButton(
                            onClick = {
                                // geo: URIs open Neshan, Balad or any installed map app
                                val uri = Uri.parse("geo:${current.latitude},${current.longitude}?q=${current.latitude},${current.longitude}(${Uri.encode(current.title)})")
                                try {
                                    context.startActivity(Intent(Intent.ACTION_VIEW, uri))
                                } catch (e: Exception) {
                                    navController.navigate(Routes.map(current.type))
                                }
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.Directions, contentDescription = null)
                            Spacer(Modifier.width(6.dp))
                            Text("مسیریابی")
                        }
                    }
                }

                item {
                    SectionTitle("نظرات کاربران")
                }
                if (reviews.isEmpty()) {
                    item {
                        Text("هنوز نظری ثبت نشده است", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                } else {
                    items(reviews, key = { it.id }) { review ->
                        Card(Modifier.fillMaxWidth()) {
                            Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(review.reviewer_name ?: "کاربر", fontWeight = FontWeight.Medium, modifier = Modifier.weight(1f))
                                    Text(formatJalaliDate(review.created_at), style = MaterialTheme.typography.labelSmall)
                                }
                                RatingRow(review.rating.toDouble())
                                review.comment?.takeIf { it.isNotBlank() }?.let { Text(it, style = MaterialTheme.typography.bodyMedium) }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun InfoLine(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, value: String) {
    Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
        Column {
            Text(label, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(value, style = MaterialTheme.typography.bodyMedium)
        }
    }
}
