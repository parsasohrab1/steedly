package ir.steedly.app.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import ir.steedly.app.data.local.TokenManager
import ir.steedly.app.ui.navigation.Routes

/** Shows [content] only for signed-in users; otherwise a prompt to log in. */
@Composable
fun RequireLogin(
    navController: NavController,
    modifier: Modifier = Modifier,
    message: String = "برای مشاهده این بخش وارد حساب کاربری شوید",
    content: @Composable () -> Unit
) {
    val token by TokenManager.token.collectAsState()
    if (token == null) {
        EmptyView(
            title = message,
            icon = Icons.Default.Lock,
            modifier = modifier,
            actionLabel = "ورود / ثبت‌نام",
            onAction = { navController.navigate(Routes.LOGIN) }
        )
    } else {
        content()
    }
}
