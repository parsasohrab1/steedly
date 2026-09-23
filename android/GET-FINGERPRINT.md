# دریافت Fingerprint برای کافه‌بازار

> اثرانگشت کلید نسخه نهایی استیدلی در [`RELEASE-SIGNING.md`](RELEASE-SIGNING.md) آمده است.

## دستور دریافت SHA-1 و SHA-256

### اگر keystore دارید:

```bash
cd android
keytool -list -v -keystore steedly-release.jks -alias steedly
```

### اگر از debug keystore استفاده می‌کنید:

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

## خروجی نمونه

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

## فقط SHA-1

```bash
keytool -list -v -keystore steedly-release.jks -alias steedly | grep SHA1
```

## فقط SHA-256

```bash
keytool -list -v -keystore steedly-release.jks -alias steedly | grep SHA256
```

## اطلاعات مورد نیاز کافه‌بازار

کافه‌بازار معمولاً نیاز به:
- **SHA-1 Fingerprint** دارد
- **SHA-256 Fingerprint** (اختیاری)

این اطلاعات را در پنل توسعه‌دهنده کافه‌بازار وارد کنید.

