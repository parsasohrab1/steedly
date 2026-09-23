@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)

package ir.steedly.app.ui.screens.shop

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import ir.steedly.app.data.local.CartItem
import ir.steedly.app.data.local.CartManager
import ir.steedly.app.data.local.TokenManager
import ir.steedly.app.ui.components.AppTopBar
import ir.steedly.app.ui.components.EmptyView
import ir.steedly.app.ui.components.RemoteImage
import ir.steedly.app.ui.navigation.Routes
import ir.steedly.app.utils.formatToman

@Composable
fun CartScreen(navController: NavController) {
    val cartItems by CartManager.items.collectAsState()
    val token by TokenManager.token.collectAsState()
    var confirmClear by remember { mutableStateOf(false) }
    val totalPrice = cartItems.sumOf { it.price * it.quantity }

    Scaffold(
        topBar = {
            AppTopBar("سبد خرید", onBack = { navController.popBackStack() }, actions = {
                if (cartItems.isNotEmpty()) {
                    TextButton(onClick = { confirmClear = true }) { Text("خالی کردن") }
                }
            })
        },
        bottomBar = {
            if (cartItems.isNotEmpty()) {
                Surface(shadowElevation = 8.dp) {
                    Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(
                            Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("جمع کل:", style = MaterialTheme.typography.titleMedium)
                            Text(
                                formatToman(totalPrice),
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                        Button(
                            onClick = { navController.navigate(if (token != null) Routes.CHECKOUT else Routes.LOGIN) },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(if (token != null) "ادامه و ثبت سفارش" else "ورود برای ثبت سفارش")
                        }
                    }
                }
            }
        }
    ) { padding ->
        if (cartItems.isEmpty()) {
            EmptyView(
                title = "سبد خرید شما خالی است",
                subtitle = "محصولات مورد نظر خود را به سبد خرید اضافه کنید",
                icon = Icons.Default.ShoppingCart,
                modifier = Modifier.padding(padding),
                actionLabel = "مشاهده محصولات",
                onAction = { navController.navigate(Routes.SHOP) { launchSingleTop = true } }
            )
        } else {
            LazyColumn(
                modifier = Modifier.padding(padding).fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(cartItems, key = { it.productId }) { item ->
                    CartItemCard(
                        item = item,
                        onOpen = { navController.navigate(Routes.product(item.slug)) },
                        onQuantityChange = { CartManager.updateQuantity(item.productId, it) },
                        onRemove = { CartManager.remove(item.productId) }
                    )
                }
            }
        }
    }

    if (confirmClear) {
        AlertDialog(
            onDismissRequest = { confirmClear = false },
            title = { Text("خالی کردن سبد") },
            text = { Text("همه محصولات از سبد خرید حذف شوند؟") },
            confirmButton = {
                TextButton(onClick = { CartManager.clear(); confirmClear = false }) { Text("حذف همه") }
            },
            dismissButton = { TextButton(onClick = { confirmClear = false }) { Text("انصراف") } }
        )
    }
}

@Composable
private fun CartItemCard(
    item: CartItem,
    onOpen: () -> Unit,
    onQuantityChange: (Int) -> Unit,
    onRemove: () -> Unit
) {
    Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(12.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            RemoteImage(
                item.image,
                item.name,
                Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .clickable(onClick = onOpen)
            )
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(item.name, fontWeight = FontWeight.Medium, maxLines = 2, overflow = TextOverflow.Ellipsis)
                Text(formatToman(item.price), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                QuantityStepper(quantity = item.quantity, onChange = onQuantityChange, max = item.stock)
            }
            IconButton(onClick = onRemove) {
                Icon(Icons.Default.Delete, contentDescription = "حذف", tint = MaterialTheme.colorScheme.error)
            }
        }
    }
}
