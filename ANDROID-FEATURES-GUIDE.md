# راهنمای قابلیت‌های اضافی Android App

## ✅ قابلیت‌های پیاده‌سازی شده

### 1. کش تصاویر (Image Caching)

سیستم کش تصاویر با استفاده از **Coil** پیاده‌سازی شده است:

#### ویژگی‌ها:
- ✅ **Memory Cache**: 25% از حافظه در دسترس
- ✅ **Disk Cache**: 50 MB برای تصاویر
- ✅ **HTTP Cache**: 10 MB برای درخواست‌های شبکه
- ✅ **Auto Cache**: تصاویر به صورت خودکار کش می‌شوند

#### استفاده:
```kotlin
// در MainActivity، ImageLoader به صورت global تنظیم شده است
val application = application as SteedlyApplication
val imageLoader = application.imageLoader

// در Composable
AsyncImage(
    model = imageUrl,
    contentDescription = "Product",
    imageLoader = imageLoader // استفاده از ImageLoader بهینه شده
)
```

#### تنظیمات:
فایل `ImageCacheConfig.kt` برای تنظیمات کش استفاده می‌شود:
- Memory Cache: 25% از RAM
- Disk Cache: 50 MB
- Cache Policy: همیشه فعال

---

### 2. آفلاین مود (Offline Mode)

سیستم آفلاین با استفاده از **Room Database** پیاده‌سازی شده است:

#### ویژگی‌ها:
- ✅ **Local Database**: Room برای ذخیره داده‌های محلی
- ✅ **Auto Sync**: همگام‌سازی خودکار هنگام اتصال به اینترنت
- ✅ **Cache Management**: پاک‌سازی خودکار داده‌های قدیمی (بیش از 7 روز)
- ✅ **Offline Repository**: Repository pattern برای مدیریت داده‌های آفلاین

#### Entities:
- `CachedProduct` - محصولات
- `CachedBlogPost` - مقالات
- `CachedCompetition` - مسابقات
- `CachedOrder` - سفارشات
- `CachedBooking` - رزروها

#### استفاده:
```kotlin
// دریافت داده‌های کش شده
val offlineRepository = OfflineRepository(database, { NetworkMonitor.isOnline(context) })
val cachedProducts = offlineRepository.getCachedProducts().collectAsState()

// کش کردن داده‌ها
offlineRepository.cacheProducts(products)
```

#### تنظیمات:
- در صفحه **تنظیمات** می‌توانید حالت آفلاین را فعال/غیرفعال کنید
- داده‌های قدیمی‌تر از 7 روز به صورت خودکار پاک می‌شوند

---

### 3. بهینه‌سازی مصرف باتری

با استفاده از **WorkManager** برای مدیریت Background Tasks:

#### ویژگی‌ها:
- ✅ **Periodic Cleanup**: پاک‌سازی دوره‌ای کش (هر 24 ساعت)
- ✅ **Smart Scheduling**: فقط در WiFi و هنگام شارژ
- ✅ **Battery Optimization**: بهینه‌سازی برای مصرف کمتر باتری

#### Worker:
- `CacheCleanupWorker`: پاک‌سازی خودکار داده‌های قدیمی

#### Constraints:
- **Network**: فقط WiFi (UNMETERED)
- **Charging**: فقط هنگام شارژ
- **Period**: هر 24 ساعت

#### استفاده:
```kotlin
// در SteedlyApplication
WorkManagerInitializer.initialize(this)
```

---

### 4. Dark Mode (حالت تاریک)

سیستم Dark Mode با تنظیمات کاربر پیاده‌سازی شده است:

#### ویژگی‌ها:
- ✅ **Auto Mode**: پیروی از تنظیمات سیستم
- ✅ **Manual Mode**: فعال/غیرفعال دستی
- ✅ **Dynamic Colors**: پشتیبانی از Dynamic Colors در Android 12+
- ✅ **Settings Screen**: صفحه تنظیمات برای تغییر حالت

#### تنظیمات:
در صفحه **تنظیمات**:
- **حالت تاریک خودکار**: پیروی از تنظیمات سیستم
- **حالت تاریک**: فعال/غیرفعال دستی (فقط وقتی Auto خاموش است)

#### استفاده:
```kotlin
// در Theme.kt
SteedlyTheme(
    darkTheme = null, // null = استفاده از تنظیمات
    content = { ... }
)
```

#### Color Schemes:
- **Light**: `LightColorScheme` با رنگ‌های آبی
- **Dark**: `DarkColorScheme` با رنگ‌های آبی
- **Dynamic**: Dynamic Colors در Android 12+

---

## 📦 Dependencies اضافه شده

```kotlin
// Room Database
implementation("androidx.room:room-runtime:2.6.1")
implementation("androidx.room:room-ktx:2.6.1")
kapt("androidx.room:room-compiler:2.6.1")

// WorkManager
implementation("androidx.work:work-runtime-ktx:2.9.0")

// Gson (برای Type Converters)
implementation("com.google.code.gson:gson:2.10.1")
```

---

## 🔧 تنظیمات

### 1. Application Class

`SteedlyApplication` باید در `AndroidManifest.xml` ثبت شود:

```xml
<application
    android:name=".SteedlyApplication"
    ...>
```

### 2. Database Migration

اگر schema تغییر کند، باید Migration اضافه کنید:

```kotlin
val MIGRATION_1_2 = object : Migration(1, 2) {
    override fun migrate(database: SupportSQLiteDatabase) {
        // Migration logic
    }
}
```

### 3. WorkManager ProGuard Rules

در `proguard-rules.pro`:

```proguard
-keep class androidx.work.** { *; }
-keep class ir.steedly.app.work.** { *; }
```

---

## 📱 استفاده در صفحات

### استفاده از Offline Repository

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

### استفاده از Dark Mode Settings

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

## 🧪 تست

### تست Offline Mode

1. اپلیکیشن را باز کنید
2. به صفحه تنظیمات بروید
3. "حالت آفلاین" را فعال کنید
4. اینترنت را خاموش کنید
5. داده‌های کش شده باید نمایش داده شوند

### تست Dark Mode

1. به صفحه تنظیمات بروید
2. "حالت تاریک خودکار" را خاموش کنید
3. "حالت تاریک" را فعال کنید
4. UI باید به حالت تاریک تغییر کند

### تست Image Cache

1. یک محصول با تصویر باز کنید
2. اینترنت را خاموش کنید
3. صفحه را ببندید و دوباره باز کنید
4. تصویر باید از کش نمایش داده شود

---

## ⚠️ نکات مهم

1. **Database Size**: Room Database می‌تواند بزرگ شود. پاک‌سازی دوره‌ای انجام می‌شود.

2. **Cache Expiry**: داده‌های قدیمی‌تر از 7 روز پاک می‌شوند.

3. **Battery**: WorkManager فقط در WiFi و هنگام شارژ کار می‌کند تا مصرف باتری را کاهش دهد.

4. **Memory**: Memory Cache برای تصاویر 25% از RAM است. در دستگاه‌های کم‌حافظه ممکن است نیاز به تنظیم باشد.

5. **Network Monitoring**: `NetworkMonitor` برای بررسی وضعیت اتصال استفاده می‌شود.

---

## 📚 منابع بیشتر

- [Room Database](https://developer.android.com/training/data-storage/room)
- [WorkManager](https://developer.android.com/topic/libraries/architecture/workmanager)
- [Coil Image Loading](https://coil-kt.github.io/coil/)
- [Material 3 Dark Theme](https://m3.material.io/styles/color/dark-theme)

---

**تاریخ به‌روزرسانی**: ۱۴۰۳/۱۲/۱۵

