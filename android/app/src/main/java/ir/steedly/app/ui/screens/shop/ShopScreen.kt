@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package ir.steedly.app.ui.screens.shop

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import ir.steedly.app.data.local.CartManager
import ir.steedly.app.data.model.Product
import ir.steedly.app.data.model.ProductCategory
import ir.steedly.app.data.remote.RetrofitClient
import ir.steedly.app.data.remote.apiCall
import ir.steedly.app.repository.OfflineRepository
import ir.steedly.app.ui.components.*
import ir.steedly.app.ui.navigation.Routes
import ir.steedly.app.utils.formatToman

@Composable
fun ShopScreen(navController: NavController) {
    val context = LocalContext.current
    val focusManager = LocalFocusManager.current
    val offline = remember { OfflineRepository.get(context) }
    val cartItems by CartManager.items.collectAsState()

    var categories by remember { mutableStateOf<List<ProductCategory>>(emptyList()) }
    var selectedCategory by remember { mutableStateOf<Int?>(null) }
    var searchInput by remember { mutableStateOf("") }
    var activeSearch by remember { mutableStateOf<String?>(null) }
    var products by remember { mutableStateOf<List<Product>>(emptyList()) }
    var page by remember { mutableIntStateOf(1) }
    var totalPages by remember { mutableIntStateOf(1) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var showingCache by remember { mutableStateOf(false) }
    var reloadKey by remember { mutableIntStateOf(0) }
    val gridState = rememberLazyGridState()

    fun restart() {
        page = 1
        products = emptyList()
    }

    LaunchedEffect(Unit) {
        apiCall { RetrofitClient.apiService.getProductCategories() }.onSuccess { categories = it }
    }

    LaunchedEffect(selectedCategory, activeSearch, page, reloadKey) {
        loading = true
        error = null
        apiCall {
            RetrofitClient.apiService.getProducts(
                page = page,
                limit = 12,
                categoryId = selectedCategory,
                search = activeSearch
            )
        }.onSuccess { data ->
            products = if (page == 1) data.products else products + data.products
            totalPages = data.pagination.totalPages
            showingCache = false
            offline.cacheProducts(data.products)
        }.onFailure { e ->
            if (page == 1) {
                val cached = offline.getCachedProducts().filter { p ->
                    (selectedCategory == null || p.category_id == selectedCategory) &&
                        (activeSearch == null || p.name.contains(activeSearch!!, ignoreCase = true))
                }
                if (cached.isNotEmpty()) {
                    products = cached
                    totalPages = 1
                    showingCache = true
                } else {
                    error = e.message
                }
            }
        }
        loading = false
    }

    val shouldLoadMore by remember {
        derivedStateOf {
            val last = gridState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
            last >= gridState.layoutInfo.totalItemsCount - 3
        }
    }
    LaunchedEffect(shouldLoadMore) {
        if (shouldLoadMore && !loading && page < totalPages && products.isNotEmpty()) page++
    }

    Scaffold(
        topBar = {
            AppTopBar("فروشگاه استیدلی", actions = {
                IconButton(onClick = { navController.navigate(Routes.CART) }) {
                    BadgedBox(badge = {
                        if (cartItems.isNotEmpty()) Badge { Text(cartItems.sumOf { it.quantity }.toString()) }
                    }) {
                        Icon(Icons.Default.ShoppingCart, contentDescription = "سبد خرید")
                    }
                }
            })
        }
    ) { padding ->
        Column(Modifier.padding(padding).fillMaxSize()) {
            if (showingCache) OfflineBanner()
            OutlinedTextField(
                value = searchInput,
                onValueChange = { searchInput = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                placeholder = { Text("جستجوی محصول...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                trailingIcon = {
                    if (searchInput.isNotEmpty()) {
                        IconButton(onClick = {
                            searchInput = ""
                            if (activeSearch != null) {
                                activeSearch = null
                                restart()
                            }
                        }) { Icon(Icons.Default.Close, contentDescription = "پاک کردن") }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(24.dp),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                keyboardActions = KeyboardActions(onSearch = {
                    activeSearch = searchInput.trim().ifBlank { null }
                    restart()
                    focusManager.clearFocus()
                })
            )

            if (categories.isNotEmpty()) {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    item {
                        FilterChip(
                            selected = selectedCategory == null,
                            onClick = { if (selectedCategory != null) { selectedCategory = null; restart() } },
                            label = { Text("همه") }
                        )
                    }
                    items(categories, key = { it.id }) { category ->
                        FilterChip(
                            selected = selectedCategory == category.id,
                            onClick = { if (selectedCategory != category.id) { selectedCategory = category.id; restart() } },
                            label = { Text(category.name) }
                        )
                    }
                }
            }

            when {
                loading && products.isEmpty() -> LoadingView()
                error != null && products.isEmpty() -> ErrorView(error!!, onRetry = { restart(); reloadKey++ })
                products.isEmpty() -> EmptyView("محصولی یافت نشد", icon = Icons.Default.Storefront)
                else -> LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    state = gridState,
                    contentPadding = PaddingValues(12.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(products, key = { it.id }) { product ->
                        ProductCard(product) { navController.navigate(Routes.product(product.slug)) }
                    }
                    if (loading) {
                        item(span = { GridItemSpan(maxLineSpan) }) {
                            Box(Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                                CircularProgressIndicator()
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ProductCard(product: Product, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp)
    ) {
        Box {
            RemoteImage(product.images?.firstOrNull(), product.name, Modifier.fillMaxWidth().height(140.dp))
            val discount = product.compare_at_price?.takeIf { it > product.price }?.let {
                ((1 - product.price / it) * 100).toInt()
            }
            if (discount != null && discount > 0) {
                Surface(
                    color = MaterialTheme.colorScheme.error,
                    shape = RoundedCornerShape(bottomEnd = 8.dp),
                    modifier = Modifier.align(Alignment.TopStart)
                ) {
                    Text(
                        "٪$discount",
                        color = MaterialTheme.colorScheme.onError,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                        style = MaterialTheme.typography.labelMedium
                    )
                }
            }
        }
        Column(Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(
                product.name,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                minLines = 2
            )
            if (product.compare_at_price != null && product.compare_at_price > product.price) {
                Text(
                    formatToman(product.compare_at_price),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textDecoration = TextDecoration.LineThrough
                )
            }
            Text(
                formatToman(product.price),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.Bold
            )
            if (product.stock_quantity <= 0) {
                Text("ناموجود", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.error)
            }
        }
    }
}
