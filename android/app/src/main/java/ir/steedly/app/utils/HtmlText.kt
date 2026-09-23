package ir.steedly.app.utils

import android.text.method.LinkMovementMethod
import android.util.TypedValue
import android.widget.TextView
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.text.HtmlCompat

/** Renders the HTML article bodies produced by the admin editor / content seed. */
@Composable
fun HtmlText(html: String, modifier: Modifier = Modifier) {
    val textColor = MaterialTheme.colorScheme.onSurface.toArgb()
    val linkColor = MaterialTheme.colorScheme.primary.toArgb()
    AndroidView(
        modifier = modifier,
        factory = { context ->
            TextView(context).apply {
                movementMethod = LinkMovementMethod.getInstance()
                setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
                setLineSpacing(0f, 1.4f)
                textDirection = TextView.TEXT_DIRECTION_RTL
            }
        },
        update = { view ->
            view.setTextColor(textColor)
            view.setLinkTextColor(linkColor)
            view.text = HtmlCompat.fromHtml(html, HtmlCompat.FROM_HTML_MODE_COMPACT).trim()
        }
    )
}
