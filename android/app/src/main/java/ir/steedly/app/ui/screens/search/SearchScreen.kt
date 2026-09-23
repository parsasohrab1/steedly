@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package ir.steedly.app.ui.screens.search

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import ir.steedly.app.data.model.SearchResults
import ir.steedly.app.data.remote.RetrofitClient
import ir.steedly.app.data.remote.apiCall
import ir.steedly.app.ui.components.*
import ir.steedly.app.ui.navigation.Routes
import ir.steedly.app.utils.formatJalaliLong
import ir.steedly.app.utils.formatToman
import kotlinx.coroutines.delay

@Composable
fun SearchScreen(navController: NavController) {
    val focusManager = LocalFocusManager.current
    val focusRequester = remember { FocusRequester() }
    var query by remember { mutableStateOf("") }
    var results by remember { mutableStateOf<SearchResults?>(null) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) { focusRequester.requestFocus() }

    // Debounced search as the user types
    LaunchedEffect(query) {
        val q = query.trim()
        if (q.length < 2) {
            results = null
            error = null
            return@LaunchedEffect
        }
        delay(400)
        loading = true
        error = null
        apiCall { RetrofitClient.apiService.search(q) }
            .onSuccess { results = it.results }
            .onFailure { error = it.message }
        loading = false
    }

    Scaffold(
        topBar = {
            TopAppBar(
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowForward, contentDescription = "بازگشت")
                    }
                },
                title = {
                    TextField(
                        value = query,
                        onValueChange = { query = it },
                        modifier = Modifier.fillMaxWidth().focusRequester(focusRequester),
                        placeholder = { Text("جستجو در مقالات، محصولات و مسابقات") },
                        singleLine = true,
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = MaterialTheme.colorScheme.surface,
                            unfocusedContainerColor = MaterialTheme.colorScheme.surface
                        ),
                        trailingIcon = {
                            if (query.isNotEmpty()) {
                                IconButton(onClick = { query = "" }) { Icon(Icons.Default.Close, contentDescription = "پاک کردن") }
                            }
                        },
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                        keyboardActions = KeyboardActions(onSearch = { focusManager.clearFocus() })
                    )
                }
            )
        }
    ) { padding ->
        val current = results
        val blog = current?.blog.orEmpty()
        val products = current?.products.orEmpty()
        val competitions = current?.competitions.orEmpty()
        when {
            query.trim().length < 2 -> EmptyView("حداقل دو حرف وارد کنید", icon = Icons.Default.Search, modifier = Modifier.padding(padding))
            loading && current == null -> LoadingView(Modifier.padding(padding))
            error != null -> ErrorView(error!!, Modifier.padding(padding))
            current != null && blog.isEmpty() && products.isEmpty() && competitions.isEmpty() ->
                EmptyView("نتیجه‌ای برای «${query.trim()}» یافت نشد", icon = Icons.Default.SearchOff, modifier = Modifier.padding(padding))
            else -> LazyColumn(Modifier.padding(padding), contentPadding = PaddingValues(vertical = 8.dp)) {
                if (products.isNotEmpty()) {
                    item { SectionTitle("محصولات", Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) }
                    items(products, key = { "p${it.id}" }) { product ->
                        ListItem(
                            modifier = Modifier.clickable { navController.navigate(Routes.product(product.slug)) },
                            leadingContent = { RemoteImage(product.image_url, product.name, Modifier.size(48.dp)) },
                            headlineContent = { Text(product.name, maxLines = 1, overflow = TextOverflow.Ellipsis) },
                            supportingContent = { product.price?.let { Text(formatToman(it)) } }
                        )
                    }
                }
                if (blog.isNotEmpty()) {
                    item { SectionTitle("مقالات", Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) }
                    items(blog, key = { "b${it.id}" }) { post ->
                        ListItem(
                            modifier = Modifier.clickable { navController.navigate(Routes.blog(post.slug)) },
                            leadingContent = { Icon(Icons.Default.Article, contentDescription = null) },
                            headlineContent = { Text(post.title, maxLines = 1, overflow = TextOverflow.Ellipsis) },
                            supportingContent = { post.excerpt?.let { Text(it, maxLines = 2, overflow = TextOverflow.Ellipsis) } }
                        )
                    }
                }
                if (competitions.isNotEmpty()) {
                    item { SectionTitle("مسابقات", Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) }
                    items(competitions, key = { "c${it.id}" }) { comp ->
                        ListItem(
                            modifier = Modifier.clickable { navController.navigate(Routes.competition(comp.slug)) },
                            leadingContent = { Icon(Icons.Default.EmojiEvents, contentDescription = null) },
                            headlineContent = { Text(comp.title, maxLines = 1, overflow = TextOverflow.Ellipsis) },
                            supportingContent = {
                                Text(listOfNotNull(comp.location, comp.start_date?.let { formatJalaliLong(it) }).joinToString(" — "))
                            }
                        )
                    }
                }
            }
        }
    }
}
