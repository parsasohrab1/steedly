# Steedly Visual Identity — Steedly Brand Guide

## Name

| | |
|---|---|
| Persian name | **Steedly** (transliteration of the Latin name) |
| Latin name | **Steedly** (from *steed*, meaning a noble horse) |
| Slogan | Horse health and care |
| Android app ID | `ir.steedly.app` |
| App link scheme (deep link) | `steedly://` |

In all languages, always write the name as “Steedly” (with a capital S).

## Logo

The Steedly mark consists of a **horse head in profile** and a **heartbeat line (ECG)** beneath it:
The horse represents the platform's main subject, and the pulse line represents **health, veterinary care and caretaking**. The line of the mane,
the eye and the nostril are cut out in the background color so that the mark stays legible even at small sizes.

| File | Usage |
|------|--------|
| [`logo-mark.svg`](logo-mark.svg) | Main mark on a teal background (app icon, favicon, social media) |
| [`logo-mark-mono.svg`](logo-mark-mono.svg) | Monochrome version without a background (stamp, single-color print, over photos) |
| [`logo-horizontal.svg`](logo-horizontal.svg) | Horizontal logo with the name and slogan (site header, invoice, email) |

**Usage rules**
- Minimum clear space around the mark: one quarter of the mark's width.
- Minimum mark size: 24 pixels (digital) / 8 mm (print).
- Do not rotate or stretch the mark, add shadows or gradients, or swap the colors.
- On busy or dark backgrounds use `logo-mark.svg` (with the teal frame).

## Brand colors

| Role | Name | HEX | Usage |
|------|------|------|--------|
| Primary | Steedly Teal | `#0F766E` | Buttons, links, top bar, mark background |
| Primary dark | Teal 900 | `#0A3F3C` | Footer, button pressed state |
| Primary light | Teal 100 | `#D5F1EC` | Highlighted card backgrounds, labels |
| Accent | Pulse Gold | `#F2B544` | Pulse line, badges and highlights |
| Accent text | Gold 700 | `#9A6A00` | Gold text on a white background |
| Text | Ink | `#0B2E2C` | Main text and the Latin name in the logo |
| Background | Paper | `#FAFDFC` | Page background |

**Accessibility (WCAG):** White text on `#0F766E` has a contrast ratio of 5.5:1 (AA). The gold color `#F2B544`
does not have enough contrast for text on a white background; for text use `#9A6A00` or dark text on a gold background.

Status colors (green = success, red = error, amber = pending) are independent of the brand colors and are used only for statuses.

### Where colors are defined in code

| Section | File |
|------|------|
| Web (Tailwind) | `frontend/tailwind.config.js` — `primary`, `accent`, `ink` |
| Web (PWA) | `frontend/public/manifest.json`, `frontend/app/layout.tsx` — `theme_color` |
| Android (Compose) | `android/app/src/main/java/ir/steedly/app/ui/theme/Color.kt`, `Theme.kt` |
| Android (resources) | `android/app/src/main/res/values/colors.xml` |
| Emails | `backend/src/services/emailService.ts` |

## Typography

- Persian: **Vazirmatn** — weight 800 for headings, 400 for body text.
- Latin: Vazirmatn / Inter.
