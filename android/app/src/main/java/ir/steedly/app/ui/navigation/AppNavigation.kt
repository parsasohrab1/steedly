package ir.steedly.app.ui.navigation

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import ir.steedly.app.data.local.TokenManager
import ir.steedly.app.ui.screens.account.BookingsScreen
import ir.steedly.app.ui.screens.account.NotificationsScreen
import ir.steedly.app.ui.screens.account.OrderDetailScreen
import ir.steedly.app.ui.screens.account.OrdersScreen
import ir.steedly.app.ui.screens.account.PaymentResultScreen
import ir.steedly.app.ui.screens.auth.ForgotPasswordScreen
import ir.steedly.app.ui.screens.auth.LoginScreen
import ir.steedly.app.ui.screens.blog.BlogDetailScreen
import ir.steedly.app.ui.screens.blog.BlogScreen
import ir.steedly.app.ui.screens.competitions.CompetitionDetailScreen
import ir.steedly.app.ui.screens.competitions.CompetitionsScreen
import ir.steedly.app.ui.screens.home.HomeScreen
import ir.steedly.app.ui.screens.profile.ProfileScreen
import ir.steedly.app.ui.screens.search.SearchScreen
import ir.steedly.app.ui.screens.services.BookingScreen
import ir.steedly.app.ui.screens.services.MapScreenNeshan
import ir.steedly.app.ui.screens.services.ProviderDetailScreen
import ir.steedly.app.ui.screens.services.ServicesScreen
import ir.steedly.app.ui.screens.settings.SettingsScreen
import ir.steedly.app.ui.screens.shop.CartScreen
import ir.steedly.app.ui.screens.shop.CheckoutScreen
import ir.steedly.app.ui.screens.shop.ProductDetailScreen
import ir.steedly.app.ui.screens.shop.ShopScreen

private data class BottomItem(val route: String, val label: String, val icon: ImageVector)

private val bottomItems = listOf(
    BottomItem(Routes.HOME, "خانه", Icons.Default.Home),
    BottomItem(Routes.BLOG, "مقالات", Icons.Default.Article),
    BottomItem(Routes.SHOP, "فروشگاه", Icons.Default.Storefront),
    BottomItem(Routes.SERVICES, "خدمات", Icons.Default.MedicalServices),
    BottomItem(Routes.COMPETITIONS, "مسابقات", Icons.Default.EmojiEvents)
)

/** Switches between top-level tabs without piling them up on the back stack. */
fun NavHostController.navigateTopLevel(route: String) {
    navigate(route) {
        popUpTo(graph.findStartDestination().id) { saveState = true }
        launchSingleTop = true
        restoreState = true
    }
}

@Composable
fun AppNavigation(
    pendingLink: String? = null,
    onLinkHandled: () -> Unit = {}
) {
    val navController = rememberNavController()
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route
    val token by TokenManager.token.collectAsState()

    // Deep links (payment result, tapped system notification)
    LaunchedEffect(pendingLink) {
        val route = Routes.fromLink(pendingLink)
        if (route != null) {
            navController.navigate(route) { launchSingleTop = true }
        }
        if (pendingLink != null) onLinkHandled()
    }

    // Ask for notification permission (Android 13+) once the user is signed in
    val context = LocalContext.current
    val permissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { }
    LaunchedEffect(token) {
        if (token != null &&
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) !=
            PackageManager.PERMISSION_GRANTED
        ) {
            permissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    Scaffold(
        bottomBar = {
            if (currentRoute in Routes.topLevel) {
                NavigationBar {
                    bottomItems.forEach { item ->
                        NavigationBarItem(
                            icon = { Icon(item.icon, contentDescription = item.label) },
                            label = { Text(item.label) },
                            selected = currentRoute == item.route,
                            onClick = { navController.navigateTopLevel(item.route) }
                        )
                    }
                }
            }
        }
    ) { outerPadding ->
        NavHost(
            navController = navController,
            startDestination = Routes.HOME,
            modifier = Modifier.padding(outerPadding)
        ) {
            composable(Routes.HOME) { HomeScreen(navController) }

            composable(Routes.BLOG) { BlogScreen(navController) }
            composable(
                Routes.BLOG_DETAIL,
                arguments = listOf(navArgument("slug") { type = NavType.StringType })
            ) { entry ->
                BlogDetailScreen(navController, entry.arguments?.getString("slug").orEmpty())
            }

            composable(Routes.SHOP) { ShopScreen(navController) }
            composable(
                Routes.PRODUCT,
                arguments = listOf(navArgument("slug") { type = NavType.StringType })
            ) { entry ->
                ProductDetailScreen(navController, entry.arguments?.getString("slug").orEmpty())
            }
            composable(Routes.CART) { CartScreen(navController) }
            composable(Routes.CHECKOUT) { CheckoutScreen(navController) }

            composable(Routes.SERVICES) { ServicesScreen(navController) }
            composable(
                Routes.PROVIDER,
                arguments = listOf(
                    navArgument("type") { type = NavType.StringType },
                    navArgument("id") { type = NavType.IntType }
                )
            ) { entry ->
                ProviderDetailScreen(
                    navController,
                    serviceType = entry.arguments?.getString("type").orEmpty(),
                    providerId = entry.arguments?.getInt("id") ?: 0
                )
            }
            composable(
                Routes.MAP,
                arguments = listOf(navArgument("type") { type = NavType.StringType })
            ) { entry ->
                MapScreenNeshan(navController, initialServiceType = entry.arguments?.getString("type").orEmpty())
            }
            composable(
                Routes.BOOKING,
                arguments = listOf(
                    navArgument("type") { type = NavType.StringType },
                    navArgument("id") { type = NavType.IntType }
                )
            ) { entry ->
                BookingScreen(
                    navController,
                    serviceType = entry.arguments?.getString("type").orEmpty(),
                    providerId = entry.arguments?.getInt("id") ?: 0
                )
            }

            composable(Routes.COMPETITIONS) { CompetitionsScreen(navController) }
            composable(
                Routes.COMPETITION_DETAIL,
                arguments = listOf(navArgument("slug") { type = NavType.StringType })
            ) { entry ->
                CompetitionDetailScreen(navController, entry.arguments?.getString("slug").orEmpty())
            }

            composable(Routes.LOGIN) { LoginScreen(navController) }
            composable(Routes.FORGOT_PASSWORD) { ForgotPasswordScreen(navController) }
            composable(Routes.PROFILE) { ProfileScreen(navController) }
            composable(Routes.ORDERS) { OrdersScreen(navController) }
            composable(
                Routes.ORDER_DETAIL,
                arguments = listOf(navArgument("id") { type = NavType.IntType })
            ) { entry ->
                OrderDetailScreen(navController, entry.arguments?.getInt("id") ?: 0)
            }
            composable(Routes.BOOKINGS) { BookingsScreen(navController) }
            composable(Routes.NOTIFICATIONS) { NotificationsScreen(navController) }
            composable(Routes.SEARCH) { SearchScreen(navController) }
            composable(Routes.SETTINGS) { SettingsScreen(navController) }
            composable(
                Routes.PAYMENT_RESULT,
                arguments = listOf(
                    navArgument("orderId") { type = NavType.IntType },
                    navArgument("status") { type = NavType.StringType; defaultValue = "failed" },
                    navArgument("refId") { type = NavType.StringType; defaultValue = "" }
                )
            ) { entry ->
                PaymentResultScreen(
                    navController,
                    orderId = entry.arguments?.getInt("orderId") ?: 0,
                    status = entry.arguments?.getString("status").orEmpty(),
                    refId = entry.arguments?.getString("refId").orEmpty().ifBlank { null }
                )
            }
        }
    }
}
