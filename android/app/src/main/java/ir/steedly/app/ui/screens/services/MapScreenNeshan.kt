@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package ir.steedly.app.ui.screens.services

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.LocationManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.core.graphics.drawable.toBitmap
import androidx.navigation.NavController
import com.carto.styles.MarkerStyle
import com.carto.styles.MarkerStyleBuilder
import ir.steedly.app.R
import ir.steedly.app.data.model.ServiceProvider
import ir.steedly.app.data.model.ServiceType
import ir.steedly.app.ui.components.AppTopBar
import ir.steedly.app.ui.components.ErrorBanner
import ir.steedly.app.ui.navigation.Routes
import org.neshan.common.model.LatLng
import org.neshan.mapsdk.MapView
import org.neshan.mapsdk.internal.utils.BitmapUtils
import org.neshan.mapsdk.model.Marker

private val TEHRAN = LatLng(35.6892, 51.3890)
private val RADIUS_OPTIONS = listOf(10, 25, 50, 100)

private fun markerStyle(context: Context, drawableRes: Int, size: Float): MarkerStyle {
    val bitmap = ContextCompat.getDrawable(context, drawableRes)!!.toBitmap()
    val builder = MarkerStyleBuilder()
    builder.setSize(size)
    builder.setBitmap(BitmapUtils.createBitmapFromAndroidBitmap(bitmap))
    return builder.buildStyle()
}

private fun hasLocationPermission(context: Context) =
    ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
        ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED

/** Last known fix from any platform provider (no Google Play Services dependency). */
@SuppressLint("MissingPermission")
private fun lastKnownLocation(context: Context): LatLng? {
    if (!hasLocationPermission(context)) return null
    val manager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
    return manager.getProviders(true)
        .mapNotNull { provider -> runCatching { manager.getLastKnownLocation(provider) }.getOrNull() }
        .maxByOrNull { it.time }
        ?.let { LatLng(it.latitude, it.longitude) }
}

@Composable
fun MapScreenNeshan(navController: NavController, initialServiceType: String) {
    val context = LocalContext.current
    var serviceType by remember {
        mutableStateOf(if (initialServiceType == ServiceType.TRANSPORTER) ServiceType.TRANSPORTER else ServiceType.VETERINARIAN)
    }
    var radius by remember { mutableIntStateOf(50) }
    var center by remember { mutableStateOf<LatLng?>(null) }
    var usingDefaultLocation by remember { mutableStateOf(false) }
    var providers by remember { mutableStateOf<List<ServiceProvider>>(emptyList()) }
    var selected by remember { mutableStateOf<ServiceProvider?>(null) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var mapView by remember { mutableStateOf<MapView?>(null) }

    fun resolveLocation() {
        val location = lastKnownLocation(context)
        usingDefaultLocation = location == null
        center = location ?: TEHRAN
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { resolveLocation() }

    LaunchedEffect(Unit) {
        if (hasLocationPermission(context)) {
            resolveLocation()
        } else {
            permissionLauncher.launch(
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
            )
        }
    }

    LaunchedEffect(center, serviceType, radius) {
        val point = center ?: return@LaunchedEffect
        loading = true
        error = null
        selected = null
        loadProviders(serviceType, latitude = point.latitude, longitude = point.longitude, radiusKm = radius)
            .onSuccess { providers = it.filter { p -> p.latitude != null && p.longitude != null } }
            .onFailure { error = it.message }
        loading = false
    }

    // Redraw markers whenever the data or the map instance changes
    LaunchedEffect(mapView, providers, center) {
        val map = mapView ?: return@LaunchedEffect
        val point = center ?: return@LaunchedEffect
        map.clearMarkers()
        map.addMarker(Marker(point, markerStyle(context, R.drawable.ic_my_location_marker, 20f)))
        val providerStyle = markerStyle(context, R.drawable.ic_map_marker, 36f)
        providers.forEach { p -> map.addMarker(Marker(LatLng(p.latitude!!, p.longitude!!), providerStyle)) }
        map.moveCamera(point, 0f)
        map.setZoom(if (radius <= 10) 13f else if (radius <= 25) 11f else 10f, 0f)
    }

    Scaffold(topBar = { AppTopBar("جستجو روی نقشه", onBack = { navController.popBackStack() }) }) { padding ->
        Column(Modifier.padding(padding).fillMaxSize()) {
            Row(
                Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = serviceType == ServiceType.VETERINARIAN,
                    onClick = { serviceType = ServiceType.VETERINARIAN },
                    label = { Text("دامپزشکان") },
                    modifier = Modifier.weight(1f)
                )
                FilterChip(
                    selected = serviceType == ServiceType.TRANSPORTER,
                    onClick = { serviceType = ServiceType.TRANSPORTER },
                    label = { Text("اسب‌کش‌ها") },
                    modifier = Modifier.weight(1f)
                )
            }
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                item { Text("شعاع:") }
                items(RADIUS_OPTIONS) { option ->
                    FilterChip(
                        selected = radius == option,
                        onClick = { radius = option },
                        label = { Text("$option کیلومتر") }
                    )
                }
            }
            if (usingDefaultLocation) {
                Text(
                    "موقعیت شما در دسترس نیست؛ نتایج اطراف تهران نمایش داده می‌شود",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                )
            }
            error?.let { ErrorBanner(it, Modifier.padding(horizontal = 16.dp, vertical = 4.dp)) }

            Box(Modifier.weight(1f).fillMaxWidth()) {
                AndroidView(
                    modifier = Modifier.fillMaxSize(),
                    factory = { ctx ->
                        MapView(ctx).also { map ->
                            map.setOnMarkerClickListener { marker ->
                                // Match by coordinates: the SDK hands back its own marker wrapper
                                val position = marker.latLng
                                selected = providers.firstOrNull {
                                    it.latitude == position.latitude && it.longitude == position.longitude
                                }
                            }
                            mapView = map
                        }
                    }
                )
                if (loading) {
                    CircularProgressIndicator(Modifier.align(Alignment.Center))
                }
                SmallFloatingActionButton(
                    onClick = {
                        if (hasLocationPermission(context)) resolveLocation()
                        else permissionLauncher.launch(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION))
                    },
                    modifier = Modifier.align(Alignment.TopEnd).padding(12.dp)
                ) {
                    Icon(Icons.Default.MyLocation, contentDescription = "موقعیت من")
                }
                if (!loading && providers.isEmpty() && center != null && error == null) {
                    Surface(
                        modifier = Modifier.align(Alignment.BottomCenter).padding(16.dp),
                        tonalElevation = 4.dp,
                        shape = MaterialTheme.shapes.medium
                    ) {
                        Text(
                            "در این محدوده ${ServiceType.label(serviceType)} ثبت نشده است. شعاع را افزایش دهید.",
                            modifier = Modifier.padding(12.dp)
                        )
                    }
                }
            }

            val current = selected ?: providers.firstOrNull()
            if (current != null) {
                Surface(shadowElevation = 8.dp) {
                    Column(Modifier.padding(12.dp)) {
                        Text(
                            if (selected == null) "${providers.size} مورد پیدا شد — نزدیک‌ترین:" else "انتخاب‌شده:",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(Modifier.height(6.dp))
                        ProviderCard(current) {
                            navController.navigate(Routes.provider(current.type, current.id))
                        }
                    }
                }
            }
        }
    }
}
