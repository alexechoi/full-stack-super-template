# Firebase Configuration

This directory contains Firebase configuration files for iOS and Android.

## Directory Structure

```
firebase/
├── development/
│   ├── GoogleService-Info.plist    # iOS config (development)
│   └── google-services.json        # Android config (development)
└── production/
    ├── GoogleService-Info.plist    # iOS config (production)
    └── google-services.json        # Android config (production)
```

## How to Get These Files

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create one)
3. Go to **Project Settings** → **General**
4. Add your iOS app:
   - Bundle ID must match your app's bundle identifier
   - Download `GoogleService-Info.plist`
5. Add your Android app:
   - Package name must match your app's package name
   - Download `google-services.json`

## Environment Variables

The app uses `APP_ENV` environment variable to select the correct config:

- `APP_ENV=development` (default) → uses `firebase/development/` configs
- `APP_ENV=production` → uses `firebase/production/` configs

## Authentication Providers Setup

After adding config files, enable these providers in Firebase Console:

1. **Email/Password**: Authentication → Sign-in method → Email/Password → Enable
2. **Google Sign-In**: Authentication → Sign-in method → Google → Enable
   - Copy the Web Client ID for `app.config.ts`
3. **Apple Sign-In**: Authentication → Sign-in method → Apple → Enable
   - Also configure in Apple Developer Portal
