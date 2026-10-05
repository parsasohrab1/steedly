# Android Release Signing

Steedly's release signing key is **never placed in the repository**. The `*.jks` and `keystore.properties` files
are excluded in `android/.gitignore`.

> ⚠️ **Do not lose this key.** If the key is lost, you can no longer publish updates for this app on Cafe Bazaar and Myket,
> and you will have to register a new app with a different package name. Keep the key file and password in at least
> **two separate safe places** (e.g. a password manager + an encrypted flash drive/hard drive).

## Key specifications

| Item | Value |
|------|--------|
| File | `steedly-release.jks` (PKCS12) |
| Alias | `steedly` |
| Algorithm | RSA 4096 bit, SHA384withRSA |
| Validity | Until September 2056 |
| SHA-1 | `FE:6E:2F:F0:32:7D:AE:0C:A9:70:2D:C4:1B:92:17:E6:C4:08:A3:1D` |
| SHA-256 | `5E:55:3F:EA:0D:1D:33:84:91:4C:4A:07:07:6E:1B:50:2A:49:1A:9E:CD:96:3E:82:73:29:28:25:4F:27:A0:8B` |

Register the SHA-1 fingerprint along with the package name `ir.steedly.app` in the **Neshan panel** (to display the map) and, if needed,
in **Cafe Bazaar**. Fingerprints are public; the password and key file are confidential.

## Building a signed version on a computer

1. Put the `steedly-release.jks` and `keystore.properties` files in the `android/` folder.
2. Run:

```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

Contents of `keystore.properties`:

```properties
storeFile=steedly-release.jks
storePassword=...
keyAlias=steedly
keyPassword=...
```

## Automatic build in GitHub Actions

On GitHub go to **Settings ← Secrets and variables ← Actions ← New repository secret** and add these four
values:

| Secret name | Value |
|-------------|--------|
| `ANDROID_KEYSTORE_BASE64` | Contents of the `keystore.base64.txt` file (base64 version of the key file) |
| `ANDROID_KEYSTORE_PASSWORD` | `storePassword` |
| `ANDROID_KEY_ALIAS` | `steedly` |
| `ANDROID_KEY_PASSWORD` | `keyPassword` |

Creating base64 from the key file (if you do not have the ready file):

```bash
base64 -w0 steedly-release.jks > keystore.base64.txt      # Linux
base64 -i steedly-release.jks -o keystore.base64.txt       # Mac
```

After setting the secrets, every CI run builds the `steedly-release-apk` file (signed APK) in the Artifacts section.
Without the secrets, CI builds an **unsigned** APK that is only for verifying the release settings and is not installable.

## Creating a new key (only if the app has not been published yet)

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore steedly-release.jks -alias steedly \
  -keyalg RSA -keysize 4096 -validity 10950 \
  -dname "CN=Steedly, OU=Mobile, O=Steedly, L=Tehran, ST=Tehran, C=IR"
```
