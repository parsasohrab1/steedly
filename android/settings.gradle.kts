pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        // Neshan map SDK
        maven { url = uri("https://maven.neshan.org/artifactory/public-maven") }
    }
}

rootProject.name = "Steedly"
include(":app")
