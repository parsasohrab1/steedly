package ir.steedly.app

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import ir.steedly.app.ui.navigation.AppNavigation
import ir.steedly.app.ui.theme.SteedlyTheme
import ir.steedly.app.work.NotificationSyncWorker

class MainActivity : ComponentActivity() {

    // Link to open once the UI is ready: a payment deep link or a notification target
    private val pendingLink = mutableStateOf<String?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)

        if (savedInstanceState == null) {
            pendingLink.value = extractLink(intent)
        }

        setContent {
            SteedlyTheme {
                // The app is Persian-only: force right-to-left regardless of device locale
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    Surface(
                        modifier = Modifier.fillMaxSize(),
                        color = MaterialTheme.colorScheme.background
                    ) {
                        AppNavigation(
                            pendingLink = pendingLink.value,
                            onLinkHandled = { pendingLink.value = null }
                        )
                    }
                }
            }
        }
    }

    // singleTask: the browser returning from the payment gateway lands here
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        extractLink(intent)?.let { pendingLink.value = it }
    }

    private fun extractLink(intent: Intent?): String? =
        intent?.getStringExtra(NotificationSyncWorker.EXTRA_LINK)
            ?: intent?.data?.takeIf { it.host == "payment" }?.toString()
}
