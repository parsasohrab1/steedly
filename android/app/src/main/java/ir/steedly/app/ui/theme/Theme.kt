package ir.steedly.app.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat
import ir.steedly.app.data.local.SettingsManager

private val LightColorScheme = lightColorScheme(
    primary = Teal600,
    onPrimary = Color.White,
    primaryContainer = Teal100,
    onPrimaryContainer = Teal950,
    secondary = Gold700,
    onSecondary = Color.White,
    secondaryContainer = Gold100,
    onSecondaryContainer = Gold900,
    tertiary = Indigo,
    onTertiary = Color.White,
    background = Paper,
    onBackground = Ink,
    surface = Paper,
    onSurface = Ink,
    surfaceVariant = Mist,
    onSurfaceVariant = Slate,
    outline = Color(0xFF6F7F7C)
)

private val DarkColorScheme = darkColorScheme(
    primary = Teal300,
    onPrimary = Teal950,
    primaryContainer = Teal700,
    onPrimaryContainer = Teal100,
    secondary = Gold400,
    onSecondary = Gold900,
    secondaryContainer = Color(0xFF5C4300),
    onSecondaryContainer = Gold100,
    tertiary = IndigoLight,
    onTertiary = Color(0xFF142B57),
    background = Night,
    onBackground = NightText,
    surface = Night,
    onSurface = NightText,
    surfaceVariant = NightSurface,
    onSurfaceVariant = Color(0xFFBEC9C6),
    outline = Color(0xFF899391)
)

@Composable
fun SteedlyTheme(
    darkTheme: Boolean? = null, // null means use settings
    // Brand colours by default; Material You wallpaper colours would hide the brand
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val context = LocalContext.current
    val darkModeAuto by SettingsManager.getDarkModeAuto().collectAsState(initial = true)
    val darkModeManual by SettingsManager.getDarkMode().collectAsState(initial = false)
    
    // Determine dark theme mode
    val isDarkTheme = when {
        darkTheme != null -> darkTheme // Explicit override
        !darkModeAuto -> darkModeManual // Manual mode
        else -> isSystemInDarkTheme() // Auto mode (follow system)
    }
    
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            if (isDarkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        isDarkTheme -> DarkColorScheme
        else -> LightColorScheme
    }
    
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.surface.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !isDarkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

