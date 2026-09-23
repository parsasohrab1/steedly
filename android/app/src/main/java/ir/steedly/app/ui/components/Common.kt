@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package ir.steedly.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Inbox
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import coil.compose.SubcomposeAsyncImage
import ir.steedly.app.data.remote.RetrofitClient

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppTopBar(
    title: String,
    onBack: (() -> Unit)? = null,
    actions: @Composable RowScope.() -> Unit = {}
) {
    TopAppBar(
        title = { Text(title, maxLines = 1) },
        navigationIcon = {
            if (onBack != null) {
                IconButton(onClick = onBack) {
                    // Material icons 1.5 are not auto-mirrored; in RTL "back" points right
                    Icon(Icons.Default.ArrowForward, contentDescription = "بازگشت")
                }
            }
        },
        actions = actions
    )
}

@Composable
fun LoadingView(modifier: Modifier = Modifier) {
    Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        CircularProgressIndicator()
    }
}

@Composable
fun ErrorView(
    message: String,
    modifier: Modifier = Modifier,
    onRetry: (() -> Unit)? = null
) {
    MessageView(
        icon = Icons.Default.CloudOff,
        title = message,
        modifier = modifier,
        iconTint = MaterialTheme.colorScheme.error,
        actionLabel = if (onRetry != null) "تلاش مجدد" else null,
        onAction = onRetry
    )
}

@Composable
fun EmptyView(
    title: String,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    icon: ImageVector = Icons.Default.Inbox,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null
) {
    MessageView(icon, title, modifier, subtitle, MaterialTheme.colorScheme.onSurfaceVariant, actionLabel, onAction)
}

@Composable
private fun MessageView(
    icon: ImageVector,
    title: String,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    iconTint: Color,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(icon, contentDescription = null, modifier = Modifier.size(64.dp), tint = iconTint)
        Spacer(Modifier.height(16.dp))
        Text(title, style = MaterialTheme.typography.titleMedium, textAlign = TextAlign.Center)
        if (subtitle != null) {
            Spacer(Modifier.height(8.dp))
            Text(
                subtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )
        }
        if (actionLabel != null && onAction != null) {
            Spacer(Modifier.height(24.dp))
            Button(onClick = onAction) { Text(actionLabel) }
        }
    }
}

/** Remote image with a neutral placeholder; accepts relative /uploads paths. */
@Composable
fun RemoteImage(
    url: String?,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    contentScale: ContentScale = ContentScale.Crop
) {
    val resolved = RetrofitClient.resolveUrl(url)
    if (resolved == null) {
        ImagePlaceholder(modifier)
        return
    }
    SubcomposeAsyncImage(
        model = resolved,
        contentDescription = contentDescription,
        modifier = modifier,
        contentScale = contentScale,
        loading = { ImagePlaceholder(Modifier.fillMaxSize()) },
        error = { ImagePlaceholder(Modifier.fillMaxSize()) }
    )
}

@Composable
private fun ImagePlaceholder(modifier: Modifier) {
    Box(
        modifier = modifier.background(MaterialTheme.colorScheme.surfaceVariant),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            Icons.Default.Image,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
            modifier = Modifier.size(40.dp)
        )
    }
}

@Composable
fun StatusChip(text: String, color: Color) {
    Surface(
        color = color.copy(alpha = 0.15f),
        contentColor = color,
        shape = RoundedCornerShape(50)
    ) {
        Text(
            text,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.SemiBold
        )
    }
}

fun statusColor(status: String): Color = when (status) {
    "paid", "delivered", "completed", "confirmed" -> Color(0xFF16A34A)
    "processing", "shipped" -> Color(0xFF2563EB)
    "cancelled", "failed" -> Color(0xFFDC2626)
    else -> Color(0xFFD97706)
}

@Composable
fun RatingRow(rating: Double, reviews: Int? = null) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(Icons.Default.Star, contentDescription = null, tint = Color(0xFFF59E0B), modifier = Modifier.size(18.dp))
        Spacer(Modifier.width(4.dp))
        Text(
            text = String.format(java.util.Locale("fa", "IR"), "%.1f", rating) +
                (reviews?.let { " (${ir.steedly.app.utils.formatNumber(it)} نظر)" } ?: ""),
            style = MaterialTheme.typography.bodySmall
        )
    }
}

@Composable
fun SectionTitle(text: String, modifier: Modifier = Modifier, action: (@Composable () -> Unit)? = null) {
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        action?.invoke()
    }
}

@Composable
fun ErrorBanner(message: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)
    ) {
        Text(
            message,
            modifier = Modifier.padding(12.dp),
            color = MaterialTheme.colorScheme.onErrorContainer
        )
    }
}

@Composable
fun OfflineBanner() {
    Surface(color = MaterialTheme.colorScheme.tertiaryContainer, modifier = Modifier.fillMaxWidth()) {
        Text(
            "حالت آفلاین — نمایش محتوای ذخیره‌شده",
            modifier = Modifier.padding(8.dp),
            style = MaterialTheme.typography.labelMedium,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onTertiaryContainer
        )
    }
}
