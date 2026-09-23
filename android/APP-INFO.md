# اطلاعات اپلیکیشن برای کافه‌بازار

## اطلاعات Bundle و Package

### Package Name (Application ID)
```
ir.steedly.app
```

### Bundle Name
```
Steedly
```

### Version
- **Version Code**: 1
- **Version Name**: 1.0.0

## اطلاعات Signing Key

### برای ساخت Signing Key

اگر هنوز keystore ندارید، از دستور زیر استفاده کنید:

```bash
keytool -genkey -v -keystore steedly-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias steedly
```

### اطلاعات Key (بعد از ساخت)

1. **Keystore File**: `steedly-key.jks` (یا مسیر کامل)
2. **Key Alias**: `steedly`
3. **Key Algorithm**: RSA
4. **Key Size**: 2048 bit
5. **Validity**: 10000 days (~27 years)

### فایل keystore.properties

فایل `keystore.properties` را در پوشه `android` ایجاد کنید:

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=steedly
storeFile=../steedly-key.jks
```

⚠️ **مهم**: این فایل را در `.gitignore` قرار دهید و هرگز commit نکنید!

## ساختار Package

```
Package: ir.steedly.app
├── Main Activity: ir.steedly.app.MainActivity
├── Application: ir.steedly.app.SteedlyApplication
└── Namespace: ir.steedly.app
```

## اطلاعات برای کافه‌بازار

### نام اپلیکیشن
```
استیدلی
```

### دسته‌بندی
- **دسته اصلی**: سبک زندگی
- **دسته فرعی**: ورزش

### توضیحات کوتاه
```
پلتفرم جامع اطلاعات، خدمات و فروشگاه آنلاین اسب
```

### توضیحات کامل
```
پلتفرم جامع اطلاعات، خدمات و فروشگاه آنلاین اسب

ویژگی‌ها:
✅ مقالات تخصصی درباره نژادها، بیماری‌ها و تجهیزات اسب
✅ رزرو آنلاین دامپزشک و اسب‌کش با نمایش روی نقشه
✅ فروشگاه آنلاین تجهیزات، داروها و مکمل‌ها
✅ اطلاع از مسابقات داخلی و بین‌المللی
✅ رابط کاربری زیبا و ساده
✅ پشتیبانی کامل از زبان فارسی
```

### اطلاعات تماس
- **ایمیل**: info@steedly.ir
- **تلفن**: 021-12345678
- **وب‌سایت**: https://steedly.ir

## مراحل ساخت و امضا

### 1. ساخت Keystore (اگر ندارید)

```bash
cd android
keytool -genkey -v -keystore steedly-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias steedly
```

سوالات:
- **First and last name**: Steedly
- **Organizational unit**: Development
- **Organization**: Steedly
- **City**: Tehran
- **State**: Tehran
- **Country code**: IR

### 2. ایجاد فایل keystore.properties

```bash
cd android
cat > keystore.properties << EOF
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=steedly
storeFile=../steedly-key.jks
EOF
```

### 3. به‌روزرسانی build.gradle.kts

فایل `android/app/build.gradle.kts` را به‌روزرسانی کنید:

```kotlin
android {
    // ... existing code ...
    
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
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
    }
}
```

### 4. ساخت Bundle (AAB)

```bash
cd android
./gradlew bundleRelease
```

فایل در مسیر زیر قرار می‌گیرد:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### 5. ساخت APK (اختیاری)

```bash
cd android
./gradlew assembleRelease
```

فایل در مسیر زیر قرار می‌گیرد:
```
android/app/build/outputs/apk/release/app-release.apk
```

## اطلاعات فنی

### Min SDK
```
24 (Android 7.0 Nougat)
```

### Target SDK
```
34 (Android 14)
```

### Compile SDK
```
34
```

### Permissions
- `android.permission.INTERNET`
- `android.permission.ACCESS_NETWORK_STATE`
- `android.permission.ACCESS_FINE_LOCATION`
- `android.permission.ACCESS_COARSE_LOCATION`

## نکات امنیتی

1. ✅ **هرگز** فایل `.jks` یا `keystore.properties` را commit نکنید
2. ✅ فایل keystore را در جای امن نگهداری کنید
3. ✅ رمزهای عبور را در password manager ذخیره کنید
4. ✅ از backup منظم استفاده کنید
5. ✅ بدون keystore نمی‌توانید اپلیکیشن را به‌روزرسانی کنید

## چک‌لیست قبل از آپلود

- [ ] Package name: `ir.steedly.app`
- [ ] Version code افزایش یافته
- [ ] Version name به‌روز شده
- [ ] Keystore ساخته شده
- [ ] فایل AAB ساخته شده
- [ ] اپلیکیشن تست شده
- [ ] آیکون و اسکرین‌شات‌ها آماده است
- [ ] توضیحات کامل است
- [ ] Privacy Policy آماده است (در صورت نیاز)

## اطلاعات Signing Key برای کافه‌بازار

کافه‌بازار نیاز به اطلاعات زیر دارد:

1. **Package Name**: `ir.steedly.app`
2. **SHA-1 Fingerprint**: (برای دریافت از keystore)
3. **SHA-256 Fingerprint**: (برای دریافت از keystore)

### دریافت Fingerprint

```bash
keytool -list -v -keystore steedly-key.jks -alias steedly
```

یا:

```bash
keytool -list -v -keystore steedly-key.jks -alias steedly | grep -E "(SHA1|SHA256)"
```

## به‌روزرسانی نسخه

برای به‌روزرسانی:

1. `versionCode` را در `build.gradle.kts` افزایش دهید:
```kotlin
versionCode = 2  // از 1 به 2
versionName = "1.0.1"
```

2. فایل جدید را بسازید:
```bash
./gradlew bundleRelease
```

3. در پنل کافه‌بازار، نسخه جدید را آپلود کنید

---

**تاریخ ایجاد**: 1403
**آخرین به‌روزرسانی**: 1403

