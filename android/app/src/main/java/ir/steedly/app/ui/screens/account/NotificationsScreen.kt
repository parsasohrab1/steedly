@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package ir.steedly.app.ui.screens.account

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import ir.steedly.app.data.model.AppNotification
import ir.steedly.app.data.remote.RetrofitClient
import ir.steedly.app.data.remote.apiCall
import ir.steedly.app.data.remote.apiCallUnit
import ir.steedly.app.ui.components.*
import ir.steedly.app.ui.navigation.Routes
import ir.steedly.app.utils.formatJalaliDate
import kotlinx.coroutines.launch

@Composable
fun NotificationsScreen(navController: NavController) {
    val scope = rememberCoroutineScope()
    var notifications by remember { mutableStateOf<List<AppNotification>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var reloadKey by remember { mutableIntStateOf(0) }

    fun markRead(id: Int) {
        notifications = notifications.map { if (it.id == id) it.copy(is_read = true) else it }
        scope.launch { apiCallUnit { RetrofitClient.apiService.markNotificationRead(id) } }
    }

    Scaffold(
        topBar = {
            AppTopBar("اعلان‌ها", onBack = { navController.popBackStack() }, actions = {
                if (notifications.any { !it.is_read }) {
                    TextButton(onClick = {
                        notifications = notifications.map { it.copy(is_read = true) }
                        scope.launch { apiCallUnit { RetrofitClient.apiService.markAllNotificationsRead() } }
                    }) { Text("خواندن همه") }
                }
            })
        }
    ) { padding ->
        RequireLogin(navController, Modifier.padding(padding)) {
            LaunchedEffect(reloadKey) {
                loading = true
                error = null
                apiCall { RetrofitClient.apiService.getNotifications(limit = 50) }
                    .onSuccess { notifications = it }
                    .onFailure { error = it.message }
                loading = false
            }
            when {
                loading -> LoadingView(Modifier.padding(padding))
                error != null -> ErrorView(error!!, Modifier.padding(padding), onRetry = { reloadKey++ })
                notifications.isEmpty() -> EmptyView("اعلانی ندارید", icon = Icons.Default.NotificationsNone, modifier = Modifier.padding(padding))
                else -> LazyColumn(
                    modifier = Modifier.padding(padding),
                    contentPadding = PaddingValues(vertical = 8.dp)
                ) {
                    items(notifications, key = { it.id }) { notification ->
                        NotificationRow(
                            notification = notification,
                            onClick = {
                                if (!notification.is_read) markRead(notification.id)
                                Routes.fromLink(notification.link)
                                    ?.takeIf { it != Routes.NOTIFICATIONS }
                                    ?.let { navController.navigate(it) }
                            },
                            onDelete = {
                                notifications = notifications.filterNot { it.id == notification.id }
                                scope.launch { apiCallUnit { RetrofitClient.apiService.deleteNotification(notification.id) } }
                            }
                        )
                        Divider()
                    }
                }
            }
        }
    }
}

@Composable
private fun NotificationRow(notification: AppNotification, onClick: () -> Unit, onDelete: () -> Unit) {
    val icon = when (notification.type) {
        "order" -> Icons.Default.ShoppingBag
        "booking" -> Icons.Default.CalendarToday
        "promotion" -> Icons.Default.LocalOffer
        else -> Icons.Default.Info
    }
    ListItem(
        modifier = Modifier.clickable(onClick = onClick),
        colors = ListItemDefaults.colors(
            containerColor = if (notification.is_read) MaterialTheme.colorScheme.surface
            else MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f)
        ),
        leadingContent = {
            BadgedBox(badge = { if (!notification.is_read) Badge() }) {
                Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            }
        },
        headlineContent = {
            Text(notification.title, fontWeight = if (notification.is_read) FontWeight.Normal else FontWeight.Bold)
        },
        supportingContent = {
            Column {
                Text(notification.message, style = MaterialTheme.typography.bodyMedium)
                Text(formatJalaliDate(notification.created_at, withTime = true), style = MaterialTheme.typography.labelSmall)
            }
        },
        trailingContent = {
            IconButton(onClick = onDelete) {
                Icon(Icons.Default.Close, contentDescription = "حذف")
            }
        }
    )
}
