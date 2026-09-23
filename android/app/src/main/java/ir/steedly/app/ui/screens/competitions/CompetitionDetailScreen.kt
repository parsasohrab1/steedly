@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package ir.steedly.app.ui.screens.competitions

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import ir.steedly.app.data.model.Competition
import ir.steedly.app.data.model.CompetitionResult
import ir.steedly.app.data.remote.RetrofitClient
import ir.steedly.app.data.remote.apiCall
import ir.steedly.app.repository.OfflineRepository
import ir.steedly.app.ui.components.*
import ir.steedly.app.utils.StatusLabels
import ir.steedly.app.utils.formatJalaliLong
import ir.steedly.app.utils.formatNumber
import ir.steedly.app.utils.parseApiDate
import java.util.Date

@Composable
fun CompetitionDetailScreen(navController: NavController, competitionSlug: String) {
    val context = LocalContext.current
    val offline = remember { OfflineRepository.get(context) }
    var competition by remember { mutableStateOf<Competition?>(null) }
    var results by remember { mutableStateOf<List<CompetitionResult>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var reloadKey by remember { mutableIntStateOf(0) }

    LaunchedEffect(competitionSlug, reloadKey) {
        loading = true
        error = null
        apiCall { RetrofitClient.apiService.getCompetition(competitionSlug) }
            .onSuccess { comp ->
                competition = comp
                apiCall { RetrofitClient.apiService.getCompetitionResults(comp.id) }
                    .onSuccess { results = it.sortedBy { r -> r.position ?: Int.MAX_VALUE } }
            }
            .onFailure { e ->
                val cached = offline.getCachedCompetition(competitionSlug)
                if (cached != null) competition = cached else error = e.message
            }
        loading = false
    }

    Scaffold(topBar = { AppTopBar("جزئیات مسابقه", onBack = { navController.popBackStack() }) }) { padding ->
        val comp = competition
        when {
            loading -> LoadingView(Modifier.padding(padding))
            error != null -> ErrorView(error!!, Modifier.padding(padding), onRetry = { reloadKey++ })
            comp != null -> Column(
                Modifier
                    .padding(padding)
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
            ) {
                if (comp.image_url != null) {
                    RemoteImage(comp.image_url, comp.title, Modifier.fillMaxWidth().height(220.dp))
                }
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        if (!comp.competition_type.isNullOrBlank()) {
                            StatusChip(StatusLabels.competitionType(comp.competition_type), MaterialTheme.colorScheme.primary)
                        }
                        if (comp.is_international == true) {
                            StatusChip("بین‌المللی", MaterialTheme.colorScheme.tertiary)
                        }
                        registrationStatus(comp)?.let { (label, color) -> StatusChip(label, color) }
                    }
                    Text(comp.title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)

                    Card(Modifier.fillMaxWidth()) {
                        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            DetailRow(Icons.Default.Place, "محل برگزاری", comp.location)
                            DetailRow(Icons.Default.CalendarToday, "تاریخ شروع", formatJalaliLong(comp.start_date))
                            comp.end_date?.let { DetailRow(Icons.Default.Event, "تاریخ پایان", formatJalaliLong(it)) }
                            comp.registration_deadline?.let { DetailRow(Icons.Default.Schedule, "مهلت ثبت‌نام", formatJalaliLong(it)) }
                        }
                    }

                    comp.description?.takeIf { it.isNotBlank() }?.let { Section("توضیحات", it) }
                    comp.prize_info?.takeIf { it.isNotBlank() }?.let { Section("جوایز", it) }
                    comp.conditions?.takeIf { it.isNotBlank() }?.let { Section("شرایط شرکت", it) }

                    if (results.isNotEmpty()) {
                        Divider()
                        Text("نتایج مسابقه", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        results.forEach { result -> ResultRow(result) }
                    }
                }
            }
        }
    }
}

private fun registrationStatus(comp: Competition): Pair<String, Color>? {
    val deadline = parseApiDate(comp.registration_deadline) ?: return null
    return if (deadline.after(Date())) "ثبت‌نام باز است" to Color(0xFF16A34A) else "ثبت‌نام بسته شد" to Color(0xFF6B7280)
}

@Composable
private fun DetailRow(icon: ImageVector, label: String, value: String) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
        Text("$label:", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
    }
}

@Composable
private fun Section(title: String, body: String) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Text(body, style = MaterialTheme.typography.bodyMedium)
    }
}

@Composable
private fun ResultRow(result: CompetitionResult) {
    val medal = when (result.position) {
        1 -> Color(0xFFF59E0B)
        2 -> Color(0xFF9CA3AF)
        3 -> Color(0xFFB45309)
        else -> MaterialTheme.colorScheme.onSurfaceVariant
    }
    Card(Modifier.fillMaxWidth()) {
        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Icon(Icons.Default.EmojiEvents, contentDescription = null, tint = medal)
            Column(Modifier.weight(1f)) {
                Text(
                    "رتبه ${result.position?.let { formatNumber(it) } ?: "-"}" +
                        (result.participant_name?.let { " — $it" } ?: ""),
                    fontWeight = FontWeight.Bold
                )
                result.horse_name?.let { Text("اسب: $it", style = MaterialTheme.typography.bodySmall) }
                result.notes?.takeIf { it.isNotBlank() }?.let {
                    Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            result.score?.let { Text("امتیاز ${formatNumber(it)}", style = MaterialTheme.typography.labelLarge) }
        }
    }
}
