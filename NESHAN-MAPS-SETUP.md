# Neshan Maps Setup Guide

## Introduction

Neshan is an Iranian map service that is a suitable alternative to Google Maps in Iran.

## Getting an API key

1. Go to the [Neshan developer panel](https://platform.neshan.org/panel/api-key)
2. Sign up or log in
3. Create a new project
4. Get an API key

## Frontend (PWA) settings

### 1. Adding the API key

In the `.env.local` file:
```
NEXT_PUBLIC_NESHAN_API_KEY=your_neshan_api_key_here
```

### 2. Using MapComponent

The `MapComponent` component uses Neshan Maps with Leaflet:

```tsx
<MapComponent
  userLocation={{ lat: 35.6892, lng: 51.3890 }}
  providers={providers}
  serviceType="veterinarian"
  onProviderSelect={handleSelect}
/>
```

### 3. Features

- ✅ Displaying the user's location
- ✅ Displaying markers for veterinarians and horse transporters
- ✅ Popup with information
- ✅ Click a marker to select
- ✅ Zoom and Pan
- ✅ RTL Support
- ✅ Uses Leaflet (free, no API key needed for the tile layer)

## Android settings

### 1. Repository

In `settings.gradle.kts`:
```kotlin
repositories {
    maven { url = uri("https://repo.neshan.org/artifactory/public-maven") }
}
```

### 2. Dependency

Add the Neshan repository in `android/settings.gradle.kts` and the libraries in `app/build.gradle.kts`:
```kotlin
maven { url = uri("https://maven.neshan.org/artifactory/public-maven") }

implementation("neshan-android-sdk:mobile-sdk:1.0.3")
implementation("neshan-android-sdk:common-sdk:0.0.3")
```

### 3. Registering the app in the Neshan panel

SDK version 1 has no API key in code; register the package name `ir.steedly.app` and the SHA-1 fingerprint of the app signature
(debug and release — guide in `android/GET-FINGERPRINT.md`) in the [Neshan developer panel](https://platform.neshan.org).

### 4. Usage in the app

The implementation is in `ui/screens/services/MapScreenNeshan.kt`: user location (without needing Google Play Services),
showing veterinarians/horse transporters with `Marker` and choosing the search radius.

## Advantages of using Neshan

1. ✅ **Iranian service**: No VPN needed
2. ✅ **High speed**: Servers inside Iran
3. ✅ **Persian support**: Full
4. ✅ **Free**: For normal usage
5. ✅ **High accuracy**: Up-to-date maps of Iran

## Documentation

- [JavaScript SDK documentation](https://developer.neshan.org/api/web/)
- [Android SDK documentation](https://developer.neshan.org/api/android/)
- [Code samples](https://developer.neshan.org/samples/)
- [Developer panel](https://platform.neshan.org/)

## Important Notes

1. **API Key**: Be sure to put the API key in the `.env.local` and `strings.xml` files
2. **HTTPS**: Use HTTPS in production
3. **Limits**: Check that your API key has no restrictions
4. **Optimization**: Use caching to reduce costs

## Comparison with Google Maps

| Feature | Neshan | Google Maps |
|-------|------|-------------|
| Access in Iran | ✅ No VPN | ❌ Needs VPN |
| Speed | ✅ High | ⚠️ Medium |
| Persian support | ✅ Full | ⚠️ Limited |
| Cost | ✅ Free (limited) | ⚠️ Paid |
| Iran map accuracy | ✅ Excellent | ✅ Good |

## Common Problems

### Map is not displayed
- Check that the API key is correct
- Check that the Leaflet script is loaded
- Check the browser Console
- Check that the tile layer URL is correct

### Location is not displayed
- Check that permission has been granted
- Test on HTTPS or localhost

### Does not work on Android
- Check that the repository has been added
- Check that the dependency has been added correctly
- Check that the API key is in strings.xml

## Support

- [Neshan support](https://developer.neshan.org/support/)
- [Full documentation](https://developer.neshan.org/docs/)
- [GitHub](https://github.com/NeshanMaps)
