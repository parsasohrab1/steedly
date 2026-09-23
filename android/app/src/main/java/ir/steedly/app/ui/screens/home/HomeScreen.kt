@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package ir.steedly.app.ui.screens.home

import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.painterResource
import ir.steedly.app.R
import ir.steedly.app.ui.theme.Gold400
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import ir.steedly.app.data.local.CartManager
import ir.steedly.app.data.local.TokenManager
import ir.steedly.app.data.model.BlogPost
import ir.steedly.app.data.model.Competition
import ir.steedly.app.data.model.Product
import ir.steedly.app.data.remote.RetrofitClient
import ir.steedly.app.data.remote.apiCall
import ir.steedly.app.ui.components.RemoteImage
import ir.steedly.app.ui.components.SectionTitle
import ir.steedly.app.ui.navigation.Routes
import ir.steedly.app.ui.navigation.navigateTopLevel
import ir.steedly.app.utils.formatJalaliLong
import ir.steedly.app.utils.formatToman
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import androidx.navigation.NavHostController

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(navController: NavController) {
    val token by TokenManager.token.collectAsState()
    val cartItems by CartManager.items.collectAsState()
    var posts by remember { mutableStateOf<List<BlogPost>>(emptyList()) }
    var products by remember { mutableStateOf<List<Product>>(emptyList()) }
    var competitions by remember { mutableStateOf<List<Competition>>(emptyList()) }
    var unread by remember { mutableIntStateOf(0) }

    LaunchedEffect(Unit) {
        coroutineScope {
            val postsJob = async { apiCall { RetrofitClient.apiService.getBlogPosts(limit = 6) } }
            val productsJob = async { apiCall { RetrofitClient.apiService.getProducts(limit = 8) } }
            val compsJob = async { apiCall { RetrofitClient.apiService.getCompetitions() } }
            postsJob.await().onSuccess { posts = it.posts }
            productsJob.await().onSuccess { products = it.products }
            compsJob.await().onSuccess { list -> competitions = list.take(3) }
        }
    }

    LaunchedEffect(token) {
        unread = if (token != null) {
            apiCall { RetrofitClient.apiService.getUnreadCount() }.getOrNull()?.count ?: 0
        } else 0
    }

    fun openTab(route: String) {
        val host = navController as? NavHostController
        if (host != null) host.navigateTopLevel(route) else navController.navigate(route)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { BrandTitle() },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    actionIconContentColor = MaterialTheme.colorScheme.onPrimary
                ),
                actions = {
                    IconButton(onClick = { navController.navigate(Routes.SEARCH) }) {
                        Icon(Icons.Default.Search, contentDescription = "جستجو")
                    }
                    IconButton(onClick = { navController.navigate(Routes.CART) }) {
                        BadgedBox(badge = {
                            if (cartItems.isNotEmpty()) Badge { Text(cartItems.sumOf { it.quantity }.toString()) }
                        }) {
                            Icon(Icons.Default.ShoppingCart, contentDescription = "سبد خرید")
                        }
                    }
                    if (token != null) {
                        IconButton(onClick = { navController.navigate(Routes.NOTIFICATIONS) }) {
                            BadgedBox(badge = { if (unread > 0) Badge { Text(unread.toString()) } }) {
                                Icon(Icons.Default.Notifications, contentDescription = "اعلان‌ها")
                            }
                        }
                    }
                    IconButton(onClick = {
                        navController.navigate(if (token != null) Routes.PROFILE else Routes.LOGIN)
                    }) {
                        Icon(Icons.Default.AccountCircle, contentDescription = "حساب کاربری")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                ) {
                    Column(Modifier.padding(20.dp)) {
                        Text(
                            "سلامت و مراقبت اسب، در یک جا",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Spacer(Modifier.height(8.dp))
                        Text(
                            "دامپزشک و اسب‌کش نزدیک شما، مقالات تخصصی سلامت اسب، فروشگاه و تقویم مسابقات",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }
            }

            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    QuickAction("دامپزشک", Icons.Default.MedicalServices, Modifier.weight(1f)) {
                        openTab(Routes.SERVICES)
                    }
                    QuickAction("نقشه", Icons.Default.Map, Modifier.weight(1f)) {
                        navController.navigate(Routes.map("veterinarian"))
                    }
                    QuickAction("فروشگاه", Icons.Default.Storefront, Modifier.weight(1f)) {
                        openTab(Routes.SHOP)
                    }
                    QuickAction("مسابقات", Icons.Default.EmojiEvents, Modifier.weight(1f)) {
                        openTab(Routes.COMPETITIONS)
                    }
                }
            }

            if (posts.isNotEmpty()) {
                item {
                    SectionTitle("آخرین مقالات", Modifier.padding(horizontal = 16.dp)) {
                        TextButton(onClick = { openTab(Routes.BLOG) }) { Text("همه") }
                    }
                }
                item {
                    LazyRow(
                        contentPadding = PaddingValues(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(posts, key = { it.id }) { post ->
                            Card(
                                modifier = Modifier
                                    .width(240.dp)
                                    .clickable { navController.navigate(Routes.blog(post.slug)) }
                            ) {
                                RemoteImage(post.featured_image, post.title, Modifier.fillMaxWidth().height(130.dp))
                                Text(
                                    post.title,
                                    modifier = Modifier.padding(12.dp),
                                    style = MaterialTheme.typography.titleSmall,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    }
                }
            }

            if (products.isNotEmpty()) {
                item {
                    SectionTitle("محصولات جدید", Modifier.padding(horizontal = 16.dp)) {
                        TextButton(onClick = { openTab(Routes.SHOP) }) { Text("همه") }
                    }
                }
                item {
                    LazyRow(
                        contentPadding = PaddingValues(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(products, key = { it.id }) { product ->
                            Card(
                                modifier = Modifier
                                    .width(160.dp)
                                    .clickable { navController.navigate(Routes.product(product.slug)) }
                            ) {
                                RemoteImage(product.images?.firstOrNull(), product.name, Modifier.fillMaxWidth().height(120.dp))
                                Column(Modifier.padding(10.dp)) {
                                    Text(product.name, maxLines = 1, overflow = TextOverflow.Ellipsis, style = MaterialTheme.typography.bodyMedium)
                                    Text(
                                        formatToman(product.price),
                                        style = MaterialTheme.typography.labelLarge,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                }
                            }
                        }
                    }
                }
            }

            if (competitions.isNotEmpty()) {
                item {
                    SectionTitle("مسابقات پیش رو", Modifier.padding(horizontal = 16.dp)) {
                        TextButton(onClick = { openTab(Routes.COMPETITIONS) }) { Text("همه") }
                    }
                }
                items(competitions, key = { it.id }) { comp ->
                    ListItem(
                        modifier = Modifier.clickable { navController.navigate(Routes.competition(comp.slug)) },
                        leadingContent = { Icon(Icons.Default.EmojiEvents, contentDescription = null, tint = MaterialTheme.colorScheme.primary) },
                        headlineContent = { Text(comp.title, maxLines = 1, overflow = TextOverflow.Ellipsis) },
                        supportingContent = { Text("${comp.location} — ${formatJalaliLong(comp.start_date)}") }
                    )
                }
            }
        }
    }
}

@Composable
private fun QuickAction(title: String, icon: ImageVector, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = modifier.height(88.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(32.dp))
            Spacer(Modifier.height(6.dp))
            Text(title, style = MaterialTheme.typography.labelLarge)
        }
    }
}

/** Brand mark + bilingual name for the home app bar. */
@Composable
private fun BrandTitle() {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Surface(
            shape = RoundedCornerShape(10.dp),
            color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.15f),
            modifier = Modifier.size(36.dp)
        ) {
            Image(
                painter = painterResource(R.drawable.ic_launcher_foreground),
                contentDescription = null,
                modifier = Modifier.fillMaxSize()
            )
        }
        Spacer(Modifier.width(10.dp))
        Column {
            Text("استیدلی", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.titleLarge)
            Text("Steedly", style = MaterialTheme.typography.labelSmall, color = Gold400)
        }
    }
}
