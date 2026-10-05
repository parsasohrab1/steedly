# Guide to Additional Android App Features

## ✅ Implemented features

### 1. Image caching (Image Caching)

The image caching system is implemented using **Coil**:

#### Features:
- ✅ **Memory Cache**: 25% of available memory
- ✅ **Disk Cache**: 50 MB for images
- ✅ **HTTP Cache**: 10 MB for network requests
- ✅ **Auto Cache**: Images are cached automatically

#### Usage:
```kotlin
// In MainActivity, ImageLoader is configured globally
val application = application as SteedlyApplication
val imageLoader = application.imageLoader

// In a Composable
AsyncImage(
    model = imageUrl,
    contentDescription = "Product",
    imageLoader = imageLoader // use the optimized ImageLoader
)
```

#### Settings:
The `ImageCacheConfig.kt` file is used for cache settings:
- Memory Cache: 25% of RAM
- Disk Cache: 50 MB
- Cache Policy: Always enabled

---

### 2. Offline mode (Offline Mode)

The offline system is implemented using **Room Database**:

#### Features:
- ✅ **Local Database**: Room for storing local data
- ✅ **Auto Sync**: Automatic synchronization when connected to the internet
- ✅ **Cache Management**: Automatic cleanup of old data (more than 7 days)
- ✅ **Offline Repository**: Repository pattern for managing offline data

#### Entities:
- `CachedProduct` - products
- `CachedBlogPost` - articles
- `CachedCompetition` - competitions
- `CachedOrder` - orders
- `CachedBooking` - bookings

#### Usage:
```kotlin
// Retrieve cached data
val offlineRepository = OfflineRepository(database, { NetworkMonitor.isOnline(context) })
val cachedProducts = offlineRepository.getCachedProducts().collectAsState()

// Cache data
offlineRepository.cacheProducts(products)
```

#### Settings:
- On the **Settings** page you can enable/disable offline mode
- Data older than 7 days is cleaned up automatically

---

### 3. Battery consumption optimization

Using **WorkManager** for managing Background Tasks:

#### Features:
- ✅ **Periodic Cleanup**: Periodic cache cleanup (every 24 hours)
- ✅ **Smart Scheduling**: Only on WiFi and while charging
- ✅ **Battery Optimization**: Optimization for lower battery consumption

#### Worker:
- `CacheCleanupWorker`: Automatic cleanup of old data

#### Constraints:
- **Network**: WiFi only (UNMETERED)
- **Charging**: Only while charging
- **Period**: Every 24 hours

#### Usage:
```kotlin
// In SteedlyApplication
WorkManagerInitializer.initialize(this)
```

---

### 4. Dark Mode

The Dark Mode system is implemented with user settings:

#### Features:
- ✅ **Auto Mode**: Follows system settings
- ✅ **Manual Mode**: Manual enable/disable
- ✅ **Dynamic Colors**: Support for Dynamic Colors on Android 12+
- ✅ **Settings Screen**: Settings page to change the mode

#### Settings:
On the **Settings** page:
- **Automatic dark mode**: Follows system settings
- **Dark mode**: Manual enable/disable (only when Auto is off)

#### Usage:
```kotlin
// In Theme.kt
SteedlyTheme(
    darkTheme = null, // null = use settings
    content = { ... }
)
```

#### Color Schemes:
- **Light**: `LightColorScheme` with blue colors
- **Dark**: `DarkColorScheme` with blue colors
- **Dynamic**: Dynamic Colors on Android 12+

---

## 📦 Added dependencies

```kotlin
// Room Database
implementation("androidx.room:room-runtime:2.6.1")
implementation("androidx.room:room-ktx:2.6.1")
kapt("androidx.room:room-compiler:2.6.1")

// WorkManager
implementation("androidx.work:work-runtime-ktx:2.9.0")

// Gson (for Type Converters)
implementation("com.google.code.gson:gson:2.10.1")
```

---

## 🔧 Settings

### 1. Application Class

`SteedlyApplication` must be registered in `AndroidManifest.xml`:

```xml
<application
    android:name=".SteedlyApplication"
    ...>
```

### 2. Database Migration

If the schema changes, you must add a Migration:

```kotlin
val MIGRATION_1_2 = object : Migration(1, 2) {
    override fun migrate(database: SupportSQLiteDatabase) {
        // Migration logic
    }
}
```

### 3. WorkManager ProGuard Rules

In `proguard-rules.pro`:

```proguard
-keep class androidx.work.** { *; }
-keep class ir.steedly.app.work.** { *; }
```

---

## 📱 Use in pages

### Using the Offline Repository

```kotlin
@Composable
fun ShopScreen(navController: NavController) {
    val context = LocalContext.current
    val application = context.applicationContext as SteedlyApplication
    val database = application.database
    val isOnline = NetworkMonitor.isOnline(context)
    
    val offlineRepository = remember {
        OfflineRepository(database) { isOnline }
    }
    
    // Load from cache if offline
    val cachedProducts = offlineRepository.getCachedProducts()
        .collectAsState(initial = emptyList())
    
    // Load from API if online
    LaunchedEffect(Unit) {
        if (isOnline) {
            // Load from API and cache
            val products = apiService.getProducts()
            offlineRepository.cacheProducts(products)
        }
    }
}
```

### Using Dark Mode Settings

```kotlin
@Composable
fun MyScreen() {
    val darkModeAuto by SettingsManager.getDarkModeAuto()
        .collectAsState(initial = true)
    val darkModeManual by SettingsManager.getDarkModeManual()
        .collectAsState(initial = false)
    
    // Use settings
}
```

---

## 🧪 Testing

### Testing Offline Mode

2. Go to the Settings page
3. Enable "Offline mode"
4. Turn off the internet
5. Cached data should be displayed
5. Cached data should be displayed

### Testing Dark Mode

1. Go to the Settings page
2. Turn off "Automatic dark mode"
3. Enable "Dark mode"
4. The UI should change to dark mode

### Testing Image Cache

1. Open a product with an image
2. Turn off the internet
3. Close the page and reopen it
4. The image should be displayed from the cache

---

## ⚠️ Important Notes

1. **Database Size**: Room Database can grow large. Periodic cleanup is performed.

2. **Cache Expiry**: Data older than 7 days is cleaned up.

3. **Battery**: WorkManager works only on WiFi and while charging to reduce battery consumption.

4. **Memory**: Image Memory Cache is 25% of RAM. On low-memory devices it may need adjustment.

5. **Network Monitoring**: `NetworkMonitor` is used to check the connection state.

---

## 📚 More resources

- [Room Database](https://developer.android.com/training/data-storage/room)
- [WorkManager](https://developer.android.com/topic/libraries/architecture/workmanager)
- [Coil Image Loading](https://coil-kt.github.io/coil/)
- [Material 3 Dark Theme](https://m3.material.io/styles/color/dark-theme)

---

**Update date**: 1403/12/15 (Solar Hijri)

