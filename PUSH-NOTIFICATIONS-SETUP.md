# Push Notifications Setup Guide

## 📱 Push Notifications support

The Push Notifications system is implemented for the following platforms:
- ✅ **Web Push Notifications** (PWA) - for modern browsers
- ⚠️ **Android** - requires Firebase Cloud Messaging (FCM)
- ⚠️ **iOS** - requires Apple Push Notification Service (APNs)

## 🔧 Backend settings

### 1. Install Dependencies

The `web-push` dependency is already installed. Android and iOS need additional settings.

### 2. Generating VAPID Keys

For Web Push Notifications you need VAPID (Voluntary Application Server Identification) keys:

```bash
cd backend
npx web-push generate-vapid-keys
```

This command generates two keys:
- **Public Key**: For use in the Frontend
- **Private Key**: For use in the Backend (confidential!)

### 3. Environment Variables settings

In the `.env` file in the `backend` folder:

```env
# Push Notifications
PUSH_NOTIFICATIONS_ENABLED=true

# VAPID Keys (for Web Push)
VAPID_PUBLIC_KEY=your-public-key-here
VAPID_PRIVATE_KEY=your-private-key-here
VAPID_SUBJECT=mailto:support@steedly.ir

# For Android (Firebase)
FCM_SERVER_KEY=your-fcm-server-key
FCM_PROJECT_ID=your-fcm-project-id

# For iOS (APNs)
APNS_KEY_ID=your-apns-key-id
APNS_TEAM_ID=your-apns-team-id
APNS_BUNDLE_ID=ir.steedly.app
APNS_KEY_PATH=./path/to/AuthKey.p8
```

### 4. Creating the database table

The `push_subscriptions` table must be created in the database:

```sql
-- This table has been added to schema.sql
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🌐 Frontend (Web) settings

### 1. Service Worker

The Service Worker (`frontend/public/sw.js`) has been updated to handle push events.

### 2. PushNotificationManager component

The `PushNotificationManager` component has been added to the profile page, which:
- Checks whether Push Notifications are supported
- Gets the VAPID public key from the server
- Requests permission from the user
- Registers the Subscription

### 3. Usage

The component is displayed automatically on the profile page. The user can enable or disable Push Notifications by clicking the button.

## 📱 Android settings (Firebase Cloud Messaging)

### 1. Creating a Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add the Android app
4. Download `google-services.json`

### 2. Settings in the Android App

Put the `google-services.json` file in `android/app/`.

In `android/app/build.gradle.kts`:

```kotlin
plugins {
    id("com.google.gms.google-services")
}

dependencies {
    implementation("com.google.firebase:firebase-messaging:23.4.0")
}
```

### 3. Implementing the FCM Service

Create a `FirebaseMessagingService` in the Android app:

```kotlin
class MyFirebaseMessagingService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        // Send the token to the server
        sendTokenToServer(token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        // Handle notification
        showNotification(remoteMessage)
    }
}
```

## 🍎 iOS settings (Apple Push Notification Service)

### 1. Settings in Apple Developer

1. Go to the [Apple Developer Portal](https://developer.apple.com/)
2. Create an App ID and enable Push Notifications
3. Create and download an APNs Key (`.p8` file)
4. Set up the Certificate in Xcode

### 2. Settings in the iOS App

In Xcode:
1. Enable Capabilities → Push Notifications
2. Enable Background Modes → Remote notifications

### 3. Implementation in iOS

```swift
import UserNotifications

func application(_ application: UIApplication, 
                 didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
        // Handle authorization
    }
    application.registerForRemoteNotifications()
    return true
}
```

## 🔌 API Endpoints

### Getting the VAPID Public Key
```
GET /api/push/vapid-key
```

### Registering a Subscription
```
POST /api/push/subscribe
Authorization: Bearer <token>
Body: {
  "subscription": {
    "endpoint": "...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

### Deleting a Subscription
```
POST /api/push/unsubscribe
Authorization: Bearer <token>
Body: {
  "endpoint": "..."
}
```

### Getting the user's Subscriptions
```
GET /api/push/subscriptions
Authorization: Bearer <token>
```

### Testing Push Notification
```
POST /api/push/test
Authorization: Bearer <token>
Body: {
  "title": "Title",
  "message": "Message",
  "link": "/optional-link",
  "type": "system"
}
```

## 🧪 Testing

### Testing Web Push

1. Start the Backend
2. Run the Frontend
3. Log in to a user account
4. Go to the profile page
5. Click the "Enable notifications" button
6. Confirm the permission
7. Use the API endpoint `/api/push/test` to send a test

### Testing in Development

To test on localhost, you must use HTTPS or use `localhost` (which browsers recognize as secure).

## ⚠️ Important Notes

1. **HTTPS**: Push Notifications only work on HTTPS or localhost
2. **VAPID Keys**: Never put the private key in the frontend
3. **Permissions**: The user must grant permission
4. **Service Worker**: A Service Worker must be registered
5. **Browser Support**: Not all browsers support Push Notifications

## 📚 More resources

- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Apple Push Notifications](https://developer.apple.com/notifications/)
- [web-push Library](https://github.com/web-push-libs/web-push)

---

**Update date**: 2025/03/06

