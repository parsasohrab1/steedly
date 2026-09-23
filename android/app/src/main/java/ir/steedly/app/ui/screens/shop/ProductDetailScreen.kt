@file:OptIn(
    androidx.compose.material3.ExperimentalMaterial3Api::class,
    androidx.compose.foundation.ExperimentalFoundationApi::class
)

package ir.steedly.app.ui.screens.shop

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import ir.steedly.app.data.local.CartManager
import ir.steedly.app.data.model.Product
import ir.steedly.app.data.remote.RetrofitClient
import ir.steedly.app.data.remote.apiCall
import ir.steedly.app.repository.OfflineRepository
import ir.steedly.app.ui.components.*
import ir.steedly.app.ui.navigation.Routes
import ir.steedly.app.utils.formatNumber
import ir.steedly.app.utils.formatToman
import kotlinx.coroutines.launch

@Composable
fun ProductDetailScreen(navController: NavController, productSlug: String) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val offline = remember { OfflineRepository.get(context) }
    val snackbar = remember { SnackbarHostState() }
    val cartItems by CartManager.items.collectAsState()

    var product by remember { mutableStateOf<Product?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var quantity by remember { mutableIntStateOf(1) }
    var reloadKey by remember { mutableIntStateOf(0) }

    LaunchedEffect(productSlug, reloadKey) {
        loading = true
        error = null
        apiCall { RetrofitClient.apiService.getProduct(productSlug) }
            .onSuccess { product = it }
            .onFailure { e ->
                val cached = offline.getCachedProduct(productSlug)
                if (cached != null) product = cached else error = e.message
            }
        loading = false
    }

    val current = product
    val inCart = current?.let { p -> cartItems.firstOrNull { it.productId == p.id }?.quantity } ?: 0

    Scaffold(
        snackbarHost = { SnackbarHost(snackbar) },
        topBar = {
            AppTopBar("جزئیات محصول", onBack = { navController.popBackStack() }, actions = {
                IconButton(onClick = { navController.navigate(Routes.CART) }) {
                    BadgedBox(badge = {
                        if (cartItems.isNotEmpty()) Badge { Text(cartItems.sumOf { it.quantity }.toString()) }
                    }) {
                        Icon(Icons.Default.ShoppingCart, contentDescription = "سبد خرید")
                    }
                }
            })
        },
        bottomBar = {
            if (current != null) {
                Surface(shadowElevation = 8.dp) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        val maxAddable = (current.stock_quantity - inCart).coerceAtLeast(0)
                        QuantityStepper(
                            quantity = quantity,
                            onChange = { quantity = it },
                            max = maxAddable.coerceAtLeast(1)
                        )
                        Button(
                            onClick = {
                                CartManager.add(current, quantity)
                                quantity = 1
                                scope.launch {
                                    val result = snackbar.showSnackbar(
                                        message = "به سبد خرید اضافه شد",
                                        actionLabel = "مشاهده سبد",
                                        duration = SnackbarDuration.Short
                                    )
                                    if (result == SnackbarResult.ActionPerformed) navController.navigate(Routes.CART)
                                }
                            },
                            modifier = Modifier.weight(1f),
                            enabled = maxAddable > 0
                        ) {
                            Icon(Icons.Default.AddShoppingCart, contentDescription = null)
                            Spacer(Modifier.width(8.dp))
                            Text(
                                when {
                                    current.stock_quantity <= 0 -> "ناموجود"
                                    maxAddable <= 0 -> "حداکثر موجودی در سبد"
                                    else -> "افزودن به سبد"
                                }
                            )
                        }
                    }
                }
            }
        }
    ) { padding ->
        when {
            loading -> LoadingView(Modifier.padding(padding))
            error != null -> ErrorView(error!!, Modifier.padding(padding), onRetry = { reloadKey++ })
            current != null -> Column(
                modifier = Modifier
                    .padding(padding)
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
            ) {
                ImageGallery(current)

                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    if (!current.category_name.isNullOrBlank()) {
                        Text(current.category_name, color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.labelLarge)
                    }
                    Text(current.name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)

                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            formatToman(current.price),
                            style = MaterialTheme.typography.titleLarge,
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold
                        )
                        if (current.compare_at_price != null && current.compare_at_price > current.price) {
                            Text(
                                formatToman(current.compare_at_price),
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                textDecoration = TextDecoration.LineThrough
                            )
                        }
                    }

                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        val available = current.stock_quantity > 0
                        Icon(
                            if (available) Icons.Default.CheckCircle else Icons.Default.Cancel,
                            contentDescription = null,
                            tint = if (available) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error
                        )
                        Text(
                            if (available) "موجود (${formatNumber(current.stock_quantity)} عدد)" else "ناموجود",
                            color = if (available) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error
                        )
                        if (inCart > 0) {
                            Text("• ${formatNumber(inCart)} عدد در سبد شما", style = MaterialTheme.typography.bodySmall)
                        }
                    }

                    if (!current.short_description.isNullOrBlank()) {
                        Text(current.short_description, style = MaterialTheme.typography.bodyLarge)
                    }

                    if (!current.description.isNullOrBlank()) {
                        Divider()
                        Text("توضیحات", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Text(current.description, style = MaterialTheme.typography.bodyMedium)
                    }

                    if (!current.sku.isNullOrBlank()) {
                        Text(
                            "کد محصول: ${current.sku}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ImageGallery(product: Product) {
    val images = product.images.orEmpty()
    if (images.size <= 1) {
        RemoteImage(images.firstOrNull(), product.name, Modifier.fillMaxWidth().height(300.dp))
        return
    }
    val pagerState = rememberPagerState(pageCount = { images.size })
    Box {
        HorizontalPager(state = pagerState) { page ->
            RemoteImage(images[page], product.name, Modifier.fillMaxWidth().height(300.dp))
        }
        Row(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(8.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            repeat(images.size) { index ->
                Box(
                    Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(
                            if (index == pagerState.currentPage) MaterialTheme.colorScheme.primary
                            else MaterialTheme.colorScheme.surface.copy(alpha = 0.7f)
                        )
                )
            }
        }
    }
}

@Composable
fun QuantityStepper(quantity: Int, onChange: (Int) -> Unit, max: Int, min: Int = 1) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        IconButton(onClick = { onChange(quantity - 1) }, enabled = quantity > min) {
            Icon(Icons.Default.Remove, contentDescription = "کاهش")
        }
        Text(formatNumber(quantity), style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(horizontal = 4.dp))
        IconButton(onClick = { onChange(quantity + 1) }, enabled = quantity < max) {
            Icon(Icons.Default.Add, contentDescription = "افزایش")
        }
    }
}
