# Steedly Android Application Guide

## Prerequisites

- Android Studio Hedgehog (2023.1.1) or higher
- JDK 17 or higher
- Android SDK (API Level 24 and above)
- Kotlin 1.9.20

## Installation and Setup

### 1. Opening the project

1. Open Android Studio
2. Select the "Open" option
3. Select the `android` folder

### 2. API configuration

The backend address is defined in `android/gradle.properties` (it must end with `/api/`):

```properties
STEEDLY_API_URL_DEBUG=http://10.0.2.2:3000/api/     # emulator → your own computer
STEEDLY_API_URL_RELEASE=https://api.steedly.ir/api/
```

**Debug build on a real phone:** no rebuild is needed. In the app go to **Settings ← Server address**
(also reachable from the login screen with the gear icon), enter the IP of the computer running the backend
(e.g. `192.168.1.10:3000`), press "Test connection" and then "Save". The phone and computer must be on the same Wi-Fi network.

- Computer IP: on Windows `ipconfig` (IPv4 Address value), on Mac/Linux `ipconfig getifaddr en0` or `hostname -I`.
- The computer firewall must allow incoming connections to port 3000.
- For test payments, also set `API_URL` in `backend/.env` to the same IP (e.g. `http://192.168.1.10:3000/api`).

The release build accepts only HTTPS and the `STEEDLY_API_URL_RELEASE` address.

### Online payment (ZarinPal)

After payment, the backend returns the user to `steedly://payment/result?...` and the app opens the payment result screen.
In the backend, `API_URL` must be an address reachable by the phone's browser.

### 3. Running the application

1. Start an Android device or Emulator
2. Press the "Run" button or press `Shift + F10`

## Project Structure

```
android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/ir/steedly/app/
│   │   │   │   ├── data/
│   │   │   │   │   ├── model/          # Data models
│   │   │   │   │   ├── remote/          # API Service and Retrofit
│   │   │   │   │   └── local/           # TokenManager and DataStore
│   │   │   │   ├── ui/
│   │   │   │   │   ├── screens/         # Application screens
│   │   │   │   │   ├── navigation/      # Navigation
│   │   │   │   │   └── theme/           # Theme and style
│   │   │   │   ├── MainActivity.kt
│   │   │   │   └── SteedlyApplication.kt
│   │   │   └── res/                     # Resources (color, style, ...)
│   │   └── test/                        # Tests
│   └── build.gradle.kts
├── build.gradle.kts
├── settings.gradle.kts
└── gradle.properties
```

## Implemented features

### ✅ MVVM architecture
- ViewModel for state management
- Repository pattern for data access
- Use of Kotlin Coroutines and Flow

### ✅ UI with Jetpack Compose
- Material Design 3
- Navigation with Navigation Compose
- Responsive and RTL Support

### ✅ Networking
- Retrofit for API calls
- OkHttp with Logging Interceptor
- Gson for JSON parsing

### ✅ Local storage
- DataStore for storing the token and settings
- SharedPreferences for simple data

### ✅ Main screens
- Home
- Articles (Blog)
- Shop
- Services
- Competitions
- Login/registration (Auth)

## Preparing for Cafe Bazaar

### 1. Changing the Package Name

If you want to change the package name:

1. In `build.gradle.kts`:
```kotlin
namespace = "ir.steedly.app"  // change this
applicationId = "ir.steedly.app"  // change this
```

2. Rename the Java folders to the new package name

### 2. App icon

Put the app icons in the following folders:
- `app/src/main/res/mipmap-hdpi/`
- `app/src/main/res/mipmap-mdpi/`
- `app/src/main/res/mipmap-xhdpi/`
- `app/src/main/res/mipmap-xxhdpi/`
- `app/src/main/res/mipmap-xxxhdpi/`

### 3. App information

In `app/src/main/res/values/strings.xml`:
```xml
<resources>
    <string name="app_name">Steedly</string>
</resources>
```

### 4. App signing

To publish on Cafe Bazaar, you must sign the application:

1. Create a Keystore:
> The release key has been created; full guide and fingerprints: [`RELEASE-SIGNING.md`](RELEASE-SIGNING.md)

```bash
keytool -genkey -v -keystore steedly-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias steedly
```

2. Create the `keystore.properties` file in the `android` folder:
```properties
storePassword=your_store_password
keyPassword=your_key_password
keyAlias=steedly
storeFile=steedly-release.jks
```

3. Add to `app/build.gradle.kts`:
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

To build the final file:

```bash
./gradlew assembleRelease  # for APK
./gradlew bundleRelease     # for AAB (recommended)
```

The final file is placed in `app/build/outputs/`.

### 6. Cafe Bazaar requirements

- ✅ Min SDK: 24 (Android 7.0)
- ✅ Target SDK: 34 (Android 14)
- ✅ RTL Support
- ✅ Persian Language Support
- ✅ Material Design

### 7. Information needed for Cafe Bazaar

- App name: Steedly
- Category: Lifestyle / Sports
- Description: A comprehensive platform for horse information, services and online shop
- Icon: 512x512 PNG
- Screenshots: at least 3 images
- Version: 1.0.0
- Size: under 100 MB

## Further development

### Adding a ViewModel

```kotlin
@HiltViewModel  // if you use Hilt
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

### Adding a Repository

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

## Testing

```bash
./gradlew test          # Unit tests
./gradlew connectedAndroidTest  # UI tests
```

## Common Problems

### Problem: Cannot resolve symbol 'R'
- Build -> Clean Project
- Build -> Rebuild Project

### Problem: API connection failed
- Check that the API address is correct
- Check that the INTERNET permission is in the Manifest
- For Android 9+, a network security config may be needed

## Support

For questions and problems, create an issue in the repository.

