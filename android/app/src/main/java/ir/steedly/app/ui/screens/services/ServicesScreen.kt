@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package ir.steedly.app.ui.screens.services

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import ir.steedly.app.data.model.ServiceProvider
import ir.steedly.app.data.model.ServiceType
import ir.steedly.app.data.model.toProvider
import ir.steedly.app.data.remote.RetrofitClient
import ir.steedly.app.data.remote.apiCall
import ir.steedly.app.ui.components.*
import ir.steedly.app.ui.navigation.Routes
import ir.steedly.app.utils.formatNumber

/** Loads veterinarians or transporters, optionally around a point. */
suspend fun loadProviders(
    type: String,
    region: String? = null,
    latitude: Double? = null,
    longitude: Double? = null,
    radiusKm: Int? = null
): Result<List<ServiceProvider>> =
    if (type == ServiceType.VETERINARIAN) {
        apiCall { RetrofitClient.apiService.getVeterinarians(region = region, latitude = latitude, longitude = longitude, radius = radiusKm) }
            .map { list -> list.map { it.toProvider() } }
    } else {
        apiCall { RetrofitClient.apiService.getTransporters(region = region, latitude = latitude, longitude = longitude, radius = radiusKm) }
            .map { list -> list.map { it.toProvider() } }
    }

@Composable
fun ServicesScreen(navController: NavController) {
    val focusManager = LocalFocusManager.current
    var selectedType by rememberSaveable { mutableStateOf(ServiceType.VETERINARIAN) }
    var regionInput by rememberSaveable { mutableStateOf("") }
    var activeRegion by rememberSaveable { mutableStateOf<String?>(null) }
    var providers by remember { mutableStateOf<List<ServiceProvider>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var reloadKey by remember { mutableIntStateOf(0) }

    LaunchedEffect(selectedType, activeRegion, reloadKey) {
        loading = true
        error = null
        loadProviders(selectedType, region = activeRegion)
            .onSuccess { providers = it }
            .onFailure { error = it.message }
        loading = false
    }

    Scaffold(
        topBar = {
            AppTopBar("خدمات اعزام", actions = {
                IconButton(onClick = { navController.navigate(Routes.map(selectedType)) }) {
                    Icon(Icons.Default.Map, contentDescription = "نقشه")
                }
            })
        }
    ) { padding ->
        Column(Modifier.padding(padding).fillMaxSize()) {
            TabRow(selectedTabIndex = if (selectedType == ServiceType.VETERINARIAN) 0 else 1) {
                Tab(
                    selected = selectedType == ServiceType.VETERINARIAN,
                    onClick = { selectedType = ServiceType.VETERINARIAN },
                    text = { Text("دامپزشکان") },
                    icon = { Icon(Icons.Default.MedicalServices, contentDescription = null) }
                )
                Tab(
                    selected = selectedType == ServiceType.TRANSPORTER,
                    onClick = { selectedType = ServiceType.TRANSPORTER },
                    text = { Text("اسب‌کش‌ها") },
                    icon = { Icon(Icons.Default.LocalShipping, contentDescription = null) }
                )
            }

            Row(
                Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = regionInput,
                    onValueChange = { regionInput = it },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("جستجو بر اساس شهر یا منطقه") },
                    leadingIcon = { Icon(Icons.Default.LocationOn, contentDescription = null) },
                    trailingIcon = {
                        if (regionInput.isNotEmpty()) {
                            IconButton(onClick = { regionInput = ""; activeRegion = null }) {
                                Icon(Icons.Default.Close, contentDescription = "پاک کردن")
                            }
                        }
                    },
                    singleLine = true,
                    shape = RoundedCornerShape(24.dp),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    keyboardActions = KeyboardActions(onSearch = {
                        activeRegion = regionInput.trim().ifBlank { null }
                        focusManager.clearFocus()
                    })
                )
                FilledTonalButton(onClick = { navController.navigate(Routes.map(selectedType)) }) {
                    Icon(Icons.Default.NearMe, contentDescription = null)
                    Spacer(Modifier.width(4.dp))
                    Text("نزدیک من")
                }
            }

            when {
                loading -> LoadingView()
                error != null -> ErrorView(error!!, onRetry = { reloadKey++ })
                providers.isEmpty() -> EmptyView(
                    title = "موردی یافت نشد",
                    subtitle = if (activeRegion != null) "منطقه دیگری را جستجو کنید" else null,
                    icon = Icons.Default.SearchOff
                )
                else -> LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(providers, key = { "${it.type}-${it.id}" }) { provider ->
                        ProviderCard(provider) {
                            navController.navigate(Routes.provider(provider.type, provider.id))
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ProviderCard(provider: ServiceProvider, onClick: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth().clickable(onClick = onClick)) {
        Row(
            Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (provider.imageUrl != null) {
                RemoteImage(provider.imageUrl, provider.title, Modifier.size(56.dp).clip(CircleShape))
            } else {
                Surface(shape = CircleShape, color = MaterialTheme.colorScheme.primaryContainer, modifier = Modifier.size(56.dp)) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            if (provider.type == ServiceType.VETERINARIAN) Icons.Default.MedicalServices else Icons.Default.LocalShipping,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }
            }
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        provider.title,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f, fill = false)
                    )
                    if (provider.isVerified) {
                        Spacer(Modifier.width(4.dp))
                        Icon(Icons.Default.Verified, contentDescription = "تأیید شده", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(16.dp))
                    }
                }
                provider.subtitle?.let {
                    Text(it, style = MaterialTheme.typography.bodySmall, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    RatingRow(provider.rating, provider.totalReviews)
                    provider.region?.let {
                        Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    provider.distance?.let {
                        Text("${formatNumber(Math.round(it * 10) / 10.0)} کیلومتر", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
            Icon(Icons.Default.ChevronLeft, contentDescription = null)
        }
    }
}
