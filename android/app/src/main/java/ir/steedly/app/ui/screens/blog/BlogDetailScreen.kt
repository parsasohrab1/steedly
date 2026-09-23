@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package ir.steedly.app.ui.screens.blog

import android.content.Intent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import ir.steedly.app.data.model.BlogPost
import ir.steedly.app.data.remote.RetrofitClient
import ir.steedly.app.data.remote.apiCall
import ir.steedly.app.repository.OfflineRepository
import ir.steedly.app.ui.components.*
import ir.steedly.app.utils.HtmlText
import ir.steedly.app.utils.formatJalaliLong
import ir.steedly.app.utils.formatNumber

@Composable
fun BlogDetailScreen(navController: NavController, slug: String) {
    val context = LocalContext.current
    val offline = remember { OfflineRepository.get(context) }
    var post by remember { mutableStateOf<BlogPost?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var fromCache by remember { mutableStateOf(false) }
    var reloadKey by remember { mutableIntStateOf(0) }

    LaunchedEffect(slug, reloadKey) {
        loading = true
        error = null
        apiCall { RetrofitClient.apiService.getBlogPost(slug) }
            .onSuccess {
                post = it
                fromCache = false
                offline.cacheBlogPost(it)
            }
            .onFailure { e ->
                val cached = offline.getCachedBlogPost(slug)
                if (cached != null) {
                    post = cached
                    fromCache = true
                } else {
                    error = e.message
                }
            }
        loading = false
    }

    Scaffold(
        topBar = {
            AppTopBar("مقاله", onBack = { navController.popBackStack() }, actions = {
                post?.let { p ->
                    IconButton(onClick = {
                        val share = Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(Intent.EXTRA_TEXT, "${p.title}\n${RetrofitClient.SERVER_ROOT}/blog/${p.slug}")
                        }
                        context.startActivity(Intent.createChooser(share, "اشتراک‌گذاری"))
                    }) {
                        Icon(Icons.Default.Share, contentDescription = "اشتراک‌گذاری")
                    }
                }
            })
        }
    ) { padding ->
        val current = post
        when {
            loading -> LoadingView(Modifier.padding(padding))
            error != null -> ErrorView(error!!, Modifier.padding(padding), onRetry = { reloadKey++ })
            current != null -> Column(
                Modifier
                    .padding(padding)
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
            ) {
                if (fromCache) OfflineBanner()
                RemoteImage(current.featured_image, current.title, Modifier.fillMaxWidth().height(220.dp))
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    if (!current.category_name.isNullOrBlank()) {
                        Text(current.category_name, color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.labelLarge)
                    }
                    Text(current.title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                    Text(
                        listOfNotNull(
                            current.author_name,
                            formatJalaliLong(current.published_at).ifBlank { null },
                            current.views_count?.let { "${formatNumber(it)} بازدید" }
                        ).joinToString(" • "),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Divider()
                    HtmlText(current.content.orEmpty(), Modifier.fillMaxWidth())
                }
            }
        }
    }
}
