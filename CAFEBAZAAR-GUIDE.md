# Cafe Bazaar Publishing Guide

## Cafe Bazaar requirements

### 1. Basic app information

- **App name**: Steedly
- **Package Name**: ir.steedly.app
- **Version**: 1.0.0
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 34 (Android 14)
- **Category**: Lifestyle / Sports

### 2. Required files

#### App icon
- Size: 512x512 pixels
- Format: PNG with transparent background
- Quality: High
- Content: Steedly logo

#### Screenshots
- At least 3 images
- Size: 1080x1920 or 1440x2560 pixels
- Format: PNG or JPG
- Content: Display of the app's main pages

#### App description
```
A comprehensive platform for horse information, services and online shop

Features:
✅ Specialized articles about horse breeds, diseases and equipment
✅ Online booking of veterinarians and horse transporters
✅ Online shop for equipment, medicines and supplements
✅ Information about domestic and international competitions
✅ Beautiful and simple user interface
✅ Full Persian language support
```

### 3. Publishing steps

#### Step 1: Build the final file (AAB)

```bash
cd android
./gradlew bundleRelease
```

The file is placed at the following path:
```
android/app/build/outputs/bundle/release/app-release.aab
```

#### Step 2: Sign the app

If you do not have a keystore yet:

> The release key has been created; full guide and fingerprints: [`android/RELEASE-SIGNING.md`](android/RELEASE-SIGNING.md)

```bash
keytool -genkey -v -keystore steedly-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias steedly
```

**⚠️ Important**: Keep the keystore file in a safe place. Without it you cannot update the app.

#### Step 3: Register on Cafe Bazaar

1. Go to the [Cafe Bazaar developer panel](https://developers.cafebazaar.ir/)
2. Log in or register
3. Click "Add new app"
4. Complete the information:
   - App name
   - Category
   - Description
   - Icon
   - Screenshots
   - AAB file

#### Step 4: Review and approval

- Cafe Bazaar reviews the app
- It usually takes 1-3 business days
- If changes are needed, you will be notified

### 4. Important notes

#### Security
- ✅ Use HTTPS for the API
- ✅ Do not store sensitive information in SharedPreferences
- ✅ Use ProGuard for obfuscation

#### Performance
- ✅ Keep the APK/AAB size small (under 100 MB)
- ✅ Use Lazy Loading
- ✅ Optimize images

#### Content
- ✅ Appropriate Persian content
- ✅ Do not use unauthorized content
- ✅ Comply with Cafe Bazaar rules

### 5. Updating the app

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

### 6. Statistics and analytics

Cafe Bazaar provides the following statistics:
- Number of installs
- Number of views
- User rating
- User reviews

### 7. Support

For problems and questions:
- [Cafe Bazaar documentation](https://developers.cafebazaar.ir/fa/docs/)
- [Cafe Bazaar support](https://developers.cafebazaar.ir/fa/support/)

## Pre-publication checklist

- [ ] The app has been tested on various devices
- [ ] All pages work
- [ ] The API is connected properly
- [ ] The icon and screenshots are ready
- [ ] The description is complete and error-free
- [ ] The app is signed
- [ ] ProGuard is enabled
- [ ] The file size is appropriate
- [ ] RTL works correctly
- [ ] Errors are handled

## Final notes

1. **First version**: It is better to start with an MVP version and add features gradually
2. **User feedback**: Read user reviews and fix problems
3. **Regular updates**: Update the app regularly
4. **Communication with users**: Respond to user comments and questions

Good luck! 🚀

