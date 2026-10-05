# App Information for Cafe Bazaar

## Bundle and Package information

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

## Signing Key information

### Creating a Signing Key

If you do not have a keystore yet, use the following command:

> The release key has been created; full guide and fingerprints: [`RELEASE-SIGNING.md`](RELEASE-SIGNING.md)

```bash
keytool -genkey -v -keystore steedly-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias steedly
```

### Key information (after creation)

1. **Keystore File**: `steedly-release.jks` (or the full path)
2. **Key Alias**: `steedly`
3. **Key Algorithm**: RSA
4. **Key Size**: 2048 bit
5. **Validity**: 10000 days (~27 years)

### The keystore.properties file

Create the `keystore.properties` file in the `android` folder:

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=steedly
storeFile=steedly-release.jks
```

⚠️ **Important**: Put this file in `.gitignore` and never commit it!

## Package structure

```
Package: ir.steedly.app
├── Main Activity: ir.steedly.app.MainActivity
├── Application: ir.steedly.app.SteedlyApplication
└── Namespace: ir.steedly.app
```

## Information for Cafe Bazaar

### App name
```
Steedly
```

### Category
- **Main category**: Lifestyle
- **Subcategory**: Sports

### Short description
```
A comprehensive platform for horse information, services and online shop
```

### Full description
```
A comprehensive platform for horse information, services and online shop

Features:
✅ Specialized articles on horse breeds, diseases and equipment
✅ Online booking of veterinarians and horse transporters with map display
✅ Online shop for equipment, medicines and supplements
✅ Information on domestic and international competitions
✅ Beautiful and simple user interface
✅ Full Persian language support
```

### Contact information
- **Email**: info@steedly.ir
- **Phone**: 021-12345678
- **Website**: https://steedly.ir

## Build and signing steps

### 1. Creating a Keystore (if you do not have one)

```bash
cd android
keytool -genkey -v -keystore steedly-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias steedly
```

Questions:
- **First and last name**: Steedly
- **Organizational unit**: Development
- **Organization**: Steedly
- **City**: Tehran
- **State**: Tehran
- **Country code**: IR

### 2. Creating the keystore.properties file

```bash
cd android
cat > keystore.properties << EOF
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=steedly
storeFile=steedly-release.jks
EOF
```

### 3. Updating build.gradle.kts

Update the file `android/app/build.gradle.kts`:

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

### 4. Building the Bundle (AAB)

```bash
cd android
./gradlew bundleRelease
```

The file is placed at the following path:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### 5. Building the APK (optional)

```bash
cd android
./gradlew assembleRelease
```

The file is placed at the following path:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Technical information

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

## Security Notes

1. ✅ **Never** commit the `.jks` or `keystore.properties` file
2. ✅ Keep the keystore file in a safe place
3. ✅ Store passwords in a password manager
4. ✅ Use regular backups
5. ✅ Without the keystore you cannot update the application

## Checklist before uploading

- [ ] Package name: `ir.steedly.app`
- [ ] Version code increased
- [ ] Version name updated
- [ ] Keystore created
- [ ] AAB file built
- [ ] Application tested
- [ ] Icon and screenshots are ready
- [ ] Description is complete
- [ ] Privacy Policy is ready (if needed)

## Signing Key information for Cafe Bazaar

Cafe Bazaar needs the following information:

1. **Package Name**: `ir.steedly.app`
2. **SHA-1 Fingerprint**: (to be obtained from the keystore)
3. **SHA-256 Fingerprint**: (to be obtained from the keystore)

### Getting the Fingerprint

```bash
keytool -list -v -keystore steedly-release.jks -alias steedly
```

Or:

```bash
keytool -list -v -keystore steedly-release.jks -alias steedly | grep -E "(SHA1|SHA256)"
```

## Version update

To update:

1. Increase `versionCode` in `build.gradle.kts`:
```kotlin
versionCode = 2  // from 1 to 2
versionName = "1.0.1"
```

2. Build the new file:
```bash
./gradlew bundleRelease
```

3. Upload the new version in the Cafe Bazaar panel

---

**Created**: 2024
**Last updated**: 2024

