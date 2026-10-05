# Icons and Logo

The source of all icons and logos is the [`brand/`](brand/) folder. The visual identity guide and corporate colors are in
[`brand/BRAND.md`](brand/BRAND.md).

| File | Usage |
|------|--------|
| `frontend/public/logo-mark.svg` | Main mark (vector favicon, PWA) |
| `frontend/public/logo-horizontal.svg` | Horizontal logo with Persian and Latin name |
| `frontend/public/icon-192x192.png`, `icon-512x512.png` | PWA icons |
| `frontend/public/apple-touch-icon.png` | iOS icon |
| `frontend/public/favicon.ico` | Browser favicon |
| `android/app/src/main/res/drawable/ic_launcher_*.xml` | Android adaptive icon (vector) |

## Regenerating the PNG icons

```bash
bash brand/export-icons.sh
```

This script builds the PNG version from `brand/logo-mark.svg` with Chromium and produces the required sizes with Pillow.
