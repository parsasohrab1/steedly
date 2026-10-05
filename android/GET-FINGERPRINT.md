# Getting the Fingerprint for Cafe Bazaar

> The fingerprint of Steedly's release key is in [`RELEASE-SIGNING.md`](RELEASE-SIGNING.md).

## Command to get SHA-1 and SHA-256

### If you have a keystore:

```bash
cd android
keytool -list -v -keystore steedly-release.jks -alias steedly
```

### If you use the debug keystore:

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

## Sample output

```
Alias name: steedly
Creation date: ...
Entry type: PrivateKeyEntry
Certificate chain length: 1
Certificate[1]:
Owner: CN=Steedly, OU=Development, O=Steedly, L=Tehran, ST=Tehran, C=IR
Issuer: CN=Steedly, OU=Development, O=Steedly, L=Tehran, ST=Tehran, C=IR
Serial number: ...
Valid from: ... until: ...
Certificate fingerprints:
         SHA1: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
         SHA256: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
```

## SHA-1 only

```bash
keytool -list -v -keystore steedly-release.jks -alias steedly | grep SHA1
```

## SHA-256 only

```bash
keytool -list -v -keystore steedly-release.jks -alias steedly | grep SHA256
```

## Information needed by Cafe Bazaar

Cafe Bazaar usually needs:
- **SHA-1 Fingerprint**
- **SHA-256 Fingerprint** (optional)

Enter this information in the Cafe Bazaar developer panel.

