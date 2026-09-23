@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package ir.steedly.app.ui.screens.blog

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import ir.steedly.app.data.model.BlogCategory
import ir.steedly.app.data.model.BlogPost
import ir.steedly.app.data.remote.RetrofitClient
import ir.steedly.app.data.remote.apiCall
import ir.steedly.app.repository.OfflineRepository
import ir.steedly.app.ui.components.*
import ir.steedly.app.ui.navigation.Routes
import ir.steedly.app.utils.formatJalaliLong
import ir.steedly.app.utils.formatNumber

@Composable
fun BlogScreen(navController: NavController) {
    val context = LocalContext.current
    val offline = remember { OfflineRepository.get(context) }
    var categories by remember { mutableStateOf<List<BlogCategory>>(emptyList()) }
    var selectedCategory by remember { mutableStateOf<Int?>(null) }
    var posts by remember { mutableStateOf<List<BlogPost>>(emptyList()) }
    var page by remember { mutableIntStateOf(1) }
    var totalPages by remember { mutableIntStateOf(1) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var showingCache by remember { mutableStateOf(false) }
    var reloadKey by remember { mutableIntStateOf(0) }
    val listState = rememberLazyListState()

    // Changing the filter restarts paging from the first page
    fun selectCategory(id: Int?) {
        if (id == selectedCategory) return
        selectedCategory = id
        page = 1
        posts = emptyList()
    }

    LaunchedEffect(Unit) {
        apiCall { RetrofitClient.apiService.getBlogCategories() }.onSuccess { categories = it }
    }

    LaunchedEffect(selectedCategory, page, reloadKey) {
        loading = true
        error = null
        apiCall { RetrofitClient.apiService.getBlogPosts(page = page, limit = 10, categoryId = selectedCategory) }
            .onSuccess { data ->
                posts = if (page == 1) data.posts else posts + data.posts
                totalPages = data.pagination.totalPages
                showingCache = false
                offline.cacheBlogPosts(data.posts)
            }
            .onFailure { e ->
                if (page == 1) {
                    val cached = offline.getCachedBlogPosts()
                        .filter { selectedCategory == null || it.category_id == selectedCategory }
                    if (cached.isNotEmpty()) {
                        posts = cached
                        totalPages = 1
                        showingCache = true
                    } else {
                        error = e.message
                    }
                }
            }
        loading = false
    }

    // Infinite scroll: request the next page when the last item becomes visible
    val shouldLoadMore by remember {
        derivedStateOf {
            val last = listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
            last >= listState.layoutInfo.totalItemsCount - 2
        }
    }
    LaunchedEffect(shouldLoadMore) {
        if (shouldLoadMore && !loading && page < totalPages && posts.isNotEmpty()) page++
    }

    Scaffold(
        topBar = {
            AppTopBar("مقالات تخصصی اسب", actions = {
                IconButton(onClick = { navController.navigate(Routes.SEARCH) }) {
                    Icon(Icons.Default.Search, contentDescription = "جستجو")
                }
            })
        }
    ) { padding ->
        Column(Modifier.padding(padding).fillMaxSize()) {
            if (showingCache) OfflineBanner()
            if (categories.isNotEmpty()) {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    item {
                        FilterChip(
                            selected = selectedCategory == null,
                            onClick = { selectCategory(null) },
                            label = { Text("همه") }
                        )
                    }
                    items(categories, key = { it.id }) { category ->
                        FilterChip(
                            selected = selectedCategory == category.id,
                            onClick = { selectCategory(category.id) },
                            label = { Text(category.name) }
                        )
                    }
                }
            }

            when {
                loading && posts.isEmpty() -> LoadingView()
                error != null && posts.isEmpty() -> ErrorView(error!!, onRetry = { page = 1; reloadKey++ })
                posts.isEmpty() -> EmptyView("مقاله‌ای یافت نشد")
                else -> LazyColumn(
                    state = listState,
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(posts, key = { it.id }) { post ->
                        BlogPostCard(post) { navController.navigate(Routes.blog(post.slug)) }
                    }
                    if (loading) {
                        item {
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
fun BlogPostCard(post: BlogPost, onClick: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth().clickable(onClick = onClick)) {
        RemoteImage(post.featured_image, post.title, Modifier.fillMaxWidth().height(170.dp))
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            if (!post.category_name.isNullOrBlank()) {
                Text(post.category_name, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary)
            }
            Text(post.title, style = MaterialTheme.typography.titleMedium, maxLines = 2, overflow = TextOverflow.Ellipsis)
            if (!post.excerpt.isNullOrBlank()) {
                Text(
                    post.excerpt,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis
                )
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    listOfNotNull(post.author_name, formatJalaliLong(post.published_at).ifBlank { null }).joinToString(" • "),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.weight(1f)
                )
                Icon(Icons.Default.Visibility, contentDescription = null, modifier = Modifier.size(14.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(Modifier.width(4.dp))
                Text(formatNumber(post.views_count ?: 0), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}
