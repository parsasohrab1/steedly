import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.kapt")
}

// Release signing: read from android/keystore.properties (local, git-ignored) or from
// environment variables (CI). Without either, release builds are left unsigned.
val keystoreProperties = Properties().apply {
    val file = rootProject.file("keystore.properties")
    if (file.exists()) file.inputStream().use { load(it) }
}

fun signingValue(property: String, envVar: String): String? =
    keystoreProperties.getProperty(property) ?: System.getenv(envVar)

val releaseStoreFile = signingValue("storeFile", "STEEDLY_KEYSTORE_FILE")

android {
    namespace = "ir.steedly.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "ir.steedly.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 2
        versionName = "1.1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }

        // Deep-link scheme the backend redirects to after a Zarinpal payment
        manifestPlaceholders["paymentScheme"] = "steedly"
    }

    signingConfigs {
        if (releaseStoreFile != null) {
            create("release") {
                storeFile = rootProject.file(releaseStoreFile)
                storePassword = signingValue("storePassword", "STEEDLY_KEYSTORE_PASSWORD")
                keyAlias = signingValue("keyAlias", "STEEDLY_KEY_ALIAS")
                keyPassword = signingValue("keyPassword", "STEEDLY_KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            // Never fall back to the debug key: an unsigned APK is safer than a wrongly signed one
            signingConfig = signingConfigs.findByName("release")
            buildConfigField(
                "String",
                "API_BASE_URL",
                "\"${project.findProperty("STEEDLY_API_URL_RELEASE") ?: "https://api.steedly.ir/api/"}\""
            )
        }
        debug {
            isMinifyEnabled = false
            buildConfigField(
                "String",
                "API_BASE_URL",
                "\"${project.findProperty("STEEDLY_API_URL_DEBUG") ?: "http://10.0.2.2:3000/api/"}\""
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.4"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

kapt {
    correctErrorTypes = true
}

dependencies {
    // Core Android
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.6.2")
    implementation("androidx.activity:activity-compose:1.8.1")

    // Compose
    implementation(platform("androidx.compose:compose-bom:2023.10.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.5")

    // ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.6.2")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.6.2")

    // Network
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")

    // Image Loading
    implementation("io.coil-kt:coil-compose:2.5.0")

    // DataStore (token and settings)
    implementation("androidx.datastore:datastore-preferences:1.0.0")

    // Room Database (offline mode)
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")

    // WorkManager (cache cleanup + notification sync)
    implementation("androidx.work:work-runtime-ktx:2.9.0")

    // Libraries the Neshan SDK's resources use but does not declare
    // (its styles extend Theme.AppCompat, its map_view layout is a ConstraintLayout)
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("com.google.android.material:material:1.11.0")

    // Neshan Maps (no Google Play Services needed, works on Cafe Bazaar / Myket devices)
    implementation("neshan-android-sdk:mobile-sdk:1.0.3")
    implementation("neshan-android-sdk:common-sdk:0.0.3")

    // Splash Screen
    implementation("androidx.core:core-splashscreen:1.0.1")

    // Gson
    implementation("com.google.code.gson:gson:2.10.1")

    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation(platform("androidx.compose:compose-bom:2023.10.01"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
