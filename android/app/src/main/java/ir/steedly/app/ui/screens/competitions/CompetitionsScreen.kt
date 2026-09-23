@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package ir.steedly.app.ui.screens.competitions

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import ir.steedly.app.data.model.Competition
import ir.steedly.app.data.remote.RetrofitClient
import ir.steedly.app.data.remote.apiCall
import ir.steedly.app.repository.OfflineRepository
import ir.steedly.app.ui.components.*
import ir.steedly.app.ui.navigation.Routes
import ir.steedly.app.utils.StatusLabels
import ir.steedly.app.utils.formatJalaliLong
import ir.steedly.app.utils.parseApiDate
import java.util.Date

private enum class CompetitionFilter(val label: String) {
    UPCOMING("پیش رو"), PAST("برگزار شده"), INTERNATIONAL("بین‌المللی"), ALL("همه")
}

@Composable
fun CompetitionsScreen(navController: NavController) {
    val context = LocalContext.current
    val offline = remember { OfflineRepository.get(context) }
    var competitions by remember { mutableStateOf<List<Competition>>(emptyList()) }
    var filter by remember { mutableStateOf(CompetitionFilter.UPCOMING) }
    var typeFilter by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var showingCache by remember { mutableStateOf(false) }
    var reloadKey by remember { mutableIntStateOf(0) }

    LaunchedEffect(reloadKey) {
        loading = true
        error = null
        apiCall { RetrofitClient.apiService.getCompetitions() }
            .onSuccess {
                competitions = it
                showingCache = false
                offline.cacheCompetitions(it)
            }
            .onFailure { e ->
                val cached = offline.getCachedCompetitions()
                if (cached.isNotEmpty()) {
                    competitions = cached.sortedBy { it.start_date }
                    showingCache = true
                } else {
                    error = e.message
                }
            }
        loading = false
    }

    val now = remember { Date() }
    val types = remember(competitions) { competitions.mapNotNull { it.competition_type }.distinct() }
    val visible = remember(competitions, filter, typeFilter) {
        competitions
            .filter { typeFilter == null || it.competition_type == typeFilter }
            .filter { comp ->
                val end = parseApiDate(comp.end_date) ?: parseApiDate(comp.start_date)
                when (filter) {
                    CompetitionFilter.UPCOMING -> end == null || !end.before(now)
                    CompetitionFilter.PAST -> end != null && end.before(now)
                    CompetitionFilter.INTERNATIONAL -> comp.is_international == true
                    CompetitionFilter.ALL -> true
                }
            }
            .let { list -> if (filter == CompetitionFilter.PAST) list.sortedByDescending { it.start_date } else list }
    }

    Scaffold(topBar = { AppTopBar("مسابقات اسب") }) { padding ->
        Column(Modifier.padding(padding).fillMaxSize()) {
            if (showingCache) OfflineBanner()
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(CompetitionFilter.values().toList()) { option ->
                    FilterChip(selected = filter == option, onClick = { filter = option }, label = { Text(option.label) })
                }
            }
            if (types.size > 1) {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    item {
                        FilterChip(selected = typeFilter == null, onClick = { typeFilter = null }, label = { Text("همه رشته‌ها") })
                    }
                    items(types) { type ->
                        FilterChip(
                            selected = typeFilter == type,
                            onClick = { typeFilter = type },
                            label = { Text(StatusLabels.competitionType(type)) }
                        )
                    }
                }
            }

            when {
                loading -> LoadingView()
                error != null -> ErrorView(error!!, onRetry = { reloadKey++ })
                visible.isEmpty() -> EmptyView("مسابقه‌ای یافت نشد", icon = Icons.Default.EmojiEvents)
                else -> LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(visible, key = { it.id }) { comp ->
                        CompetitionCard(comp) { navController.navigate(Routes.competition(comp.slug)) }
                    }
                }
            }
        }
    }
}

@Composable
private fun CompetitionCard(comp: Competition, onClick: () -> Unit) {
    Card(Modifier.fillMaxWidth().clickable(onClick = onClick)) {
        if (comp.image_url != null) {
            RemoteImage(comp.image_url, comp.title, Modifier.fillMaxWidth().height(150.dp))
        }
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (!comp.competition_type.isNullOrBlank()) {
                    StatusChip(StatusLabels.competitionType(comp.competition_type), MaterialTheme.colorScheme.primary)
                }
                if (comp.is_international == true) {
                    StatusChip("بین‌المللی", MaterialTheme.colorScheme.tertiary)
                }
            }
            Text(comp.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, maxLines = 2, overflow = TextOverflow.Ellipsis)
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Place, contentDescription = null, modifier = Modifier.size(16.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(Modifier.width(4.dp))
                Text(comp.location, style = MaterialTheme.typography.bodySmall)
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.CalendarToday, contentDescription = null, modifier = Modifier.size(16.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(Modifier.width(4.dp))
                Text(
                    formatJalaliLong(comp.start_date) + (comp.end_date?.let { " تا ${formatJalaliLong(it)}" } ?: ""),
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
    }
}
