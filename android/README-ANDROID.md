# راهنمای اپلیکیشن اندروید استیدلی

## پیش‌نیازها

- Android Studio Hedgehog (2023.1.1) یا بالاتر
- JDK 17 یا بالاتر
- Android SDK (API Level 24 به بالا)
- Kotlin 1.9.20

## نصب و راه‌اندازی

### 1. باز کردن پروژه

1. Android Studio را باز کنید
2. گزینه "Open" را انتخاب کنید
3. پوشه `android` را انتخاب کنید

### 2. پیکربندی API

آدرس بک‌اند در `android/gradle.properties` تعریف می‌شود (باید با `/api/` تمام شود):

```properties
STEEDLY_API_URL_DEBUG=http://10.0.2.2:3000/api/     # شبیه‌ساز → کامپیوتر خودتان
STEEDLY_API_URL_RELEASE=https://api.steedly.ir/api/
```

برای گوشی واقعی در شبکه محلی، IP کامپیوتر را بگذارید (مثلاً `http://192.168.1.10:3000/api/`) و آن IP را
به `res/xml/network_security_config.xml` اضافه کنید (HTTP فقط برای آدرس‌های توسعه مجاز است).

### پرداخت آنلاین (زرین‌پال)

پس از پرداخت، بک‌اند کاربر را به `steedly://payment/result?...` برمی‌گرداند و اپ صفحه نتیجه پرداخت را باز می‌کند.
در بک‌اند مقدار `API_URL` باید آدرسی باشد که مرورگر گوشی به آن دسترسی دارد.

### 3. اجرای اپلیکیشن

1. یک دستگاه Android یا Emulator را راه‌اندازی کنید
2. دکمه "Run" را بزنید یا `Shift + F10` را فشار دهید

## ساختار پروژه

```
android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/ir/steedly/app/
│   │   │   │   ├── data/
│   │   │   │   │   ├── model/          # مدل‌های داده
│   │   │   │   │   ├── remote/          # API Service و Retrofit
│   │   │   │   │   └── local/           # TokenManager و DataStore
│   │   │   │   ├── ui/
│   │   │   │   │   ├── screens/         # صفحات اپلیکیشن
│   │   │   │   │   ├── navigation/      # Navigation
│   │   │   │   │   └── theme/           # تم و استایل
│   │   │   │   ├── MainActivity.kt
│   │   │   │   └── SteedlyApplication.kt
│   │   │   └── res/                     # منابع (رنگ، استایل، ...)
│   │   └── test/                        # تست‌ها
│   └── build.gradle.kts
├── build.gradle.kts
├── settings.gradle.kts
└── gradle.properties
```

## ویژگی‌های پیاده‌سازی شده

### ✅ معماری MVVM
- ViewModel برای مدیریت state
- Repository pattern برای دسترسی به داده
- استفاده از Kotlin Coroutines و Flow

### ✅ UI با Jetpack Compose
- Material Design 3
- Navigation با Navigation Compose
- Responsive و RTL Support

### ✅ شبکه‌ای
- Retrofit برای API calls
- OkHttp با Logging Interceptor
- Gson برای JSON parsing

### ✅ ذخیره‌سازی محلی
- DataStore برای ذخیره token و تنظیمات
- SharedPreferences برای داده‌های ساده

### ✅ صفحات اصلی
- صفحه اصلی (Home)
- مقالات (Blog)
- فروشگاه (Shop)
- خدمات (Services)
- مسابقات (Competitions)
- ورود/ثبت‌نام (Auth)

## آماده‌سازی برای کافه‌بازار

### 1. تغییر Package Name

اگر می‌خواهید package name را تغییر دهید:

1. در `build.gradle.kts`:
```kotlin
namespace = "ir.steedly.app"  // تغییر دهید
applicationId = "ir.steedly.app"  // تغییر دهید
```

2. پوشه‌های Java را به package name جدید تغییر نام دهید

### 2. آیکون اپلیکیشن

آیکون‌های اپلیکیشن را در پوشه‌های زیر قرار دهید:
- `app/src/main/res/mipmap-hdpi/`
- `app/src/main/res/mipmap-mdpi/`
- `app/src/main/res/mipmap-xhdpi/`
- `app/src/main/res/mipmap-xxhdpi/`
- `app/src/main/res/mipmap-xxxhdpi/`

### 3. اطلاعات اپلیکیشن

در `app/src/main/res/values/strings.xml`:
```xml
<resources>
    <string name="app_name">استیدلی</string>
</resources>
```

### 4. امضای اپلیکیشن (Signing)

برای انتشار در کافه‌بازار، باید اپلیکیشن را امضا کنید:

1. یک Keystore ایجاد کنید:
```bash
keytool -genkey -v -keystore steedly-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias steedly
```

2. فایل `keystore.properties` را در پوشه `android` ایجاد کنید:
```properties
storePassword=your_store_password
keyPassword=your_key_password
keyAlias=steedly
storeFile=../steedly-key.jks
```

3. در `app/build.gradle.kts` اضافه کنید:
```kotlin
android {
    signingConfigs {
        create("release") {
            val keystorePropertiesFile = rootProject.file("keystore.properties")
            val keystoreProperties = java.util.Properties()
            keystoreProperties.load(java.io.FileInputStream(keystorePropertiesFile))
            
            keyAlias = keystoreProperties["keyAlias"] as String
            keyPassword = keystoreProperties["keyPassword"] as String
            storeFile = file(keystoreProperties["storeFile"] as String)
            storePassword = keystoreProperties["storePassword"] as String
        }
    }
    
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
        }
    }
}
```

### 5. Build APK/AAB

برای ساخت فایل نهایی:

```bash
./gradlew assembleRelease  # برای APK
./gradlew bundleRelease     # برای AAB (توصیه می‌شود)
```

فایل نهایی در `app/build/outputs/` قرار می‌گیرد.

### 6. الزامات کافه‌بازار

- ✅ Min SDK: 24 (Android 7.0)
- ✅ Target SDK: 34 (Android 14)
- ✅ RTL Support
- ✅ Persian Language Support
- ✅ Material Design

### 7. اطلاعات مورد نیاز برای کافه‌بازار

- نام اپلیکیشن: استیدلی
- دسته‌بندی: سبک زندگی / ورزش
- توضیحات: پلتفرم جامع اطلاعات، خدمات و فروشگاه آنلاین اسب
- آیکون: 512x512 PNG
- اسکرین‌شات‌ها: حداقل 3 تصویر
- نسخه: 1.0.0
- حجم: کمتر از 100 مگابایت

## توسعه بیشتر

### افزودن ViewModel

```kotlin
@HiltViewModel  // اگر از Hilt استفاده می‌کنید
class BlogViewModel @Inject constructor(
    private val repository: BlogRepository
) : ViewModel() {
    val posts = repository.getPosts().stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )
}
```

### افزودن Repository

```kotlin
class BlogRepository(
    private val apiService: ApiService
) {
    suspend fun getPosts(): Flow<List<BlogPost>> = flow {
        val response = apiService.getBlogPosts()
        if (response.isSuccessful) {
            emit(response.body()?.data?.posts ?: emptyList())
        }
    }.flowOn(Dispatchers.IO)
}
```

## تست

```bash
./gradlew test          # تست‌های واحد
./gradlew connectedAndroidTest  # تست‌های UI
```

## مشکلات رایج

### مشکل: Cannot resolve symbol 'R'
- Build -> Clean Project
- Build -> Rebuild Project

### مشکل: API connection failed
- بررسی کنید که آدرس API درست باشد
- بررسی کنید که INTERNET permission در Manifest باشد
- برای Android 9+، ممکن است نیاز به network security config باشد

## پشتیبانی

برای سوالات و مشکلات، issue در repository ایجاد کنید.

