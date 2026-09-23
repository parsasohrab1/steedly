package ir.steedly.app.data.local

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import ir.steedly.app.data.model.Product
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class CartItem(
    val productId: Int,
    val slug: String,
    val name: String,
    val price: Double,
    val image: String?,
    val quantity: Int,
    val stock: Int
)

/** Shopping cart persisted in SharedPreferences and exposed as a StateFlow. */
object CartManager {
    private const val PREFS = "steedly_cart"
    private const val KEY_ITEMS = "items"

    private val gson = Gson()
    private var prefs: SharedPreferences? = null

    private val _items = MutableStateFlow<List<CartItem>>(emptyList())
    val items: StateFlow<List<CartItem>> = _items.asStateFlow()

    fun init(context: Context) {
        if (prefs != null) return
        prefs = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        _items.value = load()
    }

    val totalQuantity: Int get() = _items.value.sumOf { it.quantity }
    val totalPrice: Double get() = _items.value.sumOf { it.price * it.quantity }

    /** Adds [quantity] of a product, capped at the available stock. Returns the new quantity. */
    fun add(product: Product, quantity: Int = 1): Int {
        val current = _items.value.toMutableList()
        val index = current.indexOfFirst { it.productId == product.id }
        val existing = current.getOrNull(index)
        val newQuantity = ((existing?.quantity ?: 0) + quantity).coerceAtMost(product.stock_quantity)
        val item = CartItem(
            productId = product.id,
            slug = product.slug,
            name = product.name,
            price = product.price,
            image = product.images?.firstOrNull(),
            quantity = newQuantity,
            stock = product.stock_quantity
        )
        if (index >= 0) current[index] = item else current.add(item)
        save(current)
        return newQuantity
    }

    fun updateQuantity(productId: Int, quantity: Int) {
        val updated = _items.value.mapNotNull { item ->
            when {
                item.productId != productId -> item
                quantity <= 0 -> null
                else -> item.copy(quantity = quantity.coerceAtMost(item.stock))
            }
        }
        save(updated)
    }

    fun remove(productId: Int) = save(_items.value.filterNot { it.productId == productId })

    fun clear() = save(emptyList())

    private fun save(items: List<CartItem>) {
        _items.value = items
        prefs?.edit()?.putString(KEY_ITEMS, gson.toJson(items))?.apply()
    }

    private fun load(): List<CartItem> {
        val json = prefs?.getString(KEY_ITEMS, null) ?: return emptyList()
        return try {
            gson.fromJson(json, object : TypeToken<List<CartItem>>() {}.type) ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }
}
