# Building the Android App

This document provides instructions for building and running the Android version of the Productivity App.

## Prerequisites

1. Install Node.js and npm
2. Install Android Studio
3. Install JDK 11 or newer
4. Set up Android SDK and environment variables

## Setup

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Install Capacitor CLI globally:
   \`\`\`
   npm install -g @capacitor/cli
   \`\`\`

3. Initialize Capacitor in your project (if not already done):
   \`\`\`
   npx cap init
   \`\`\`

## Building the App

1. Build the Next.js project:
   \`\`\`
   npm run build
   \`\`\`

2. Add Android platform (if not already added):
   \`\`\`
   npx cap add android
   \`\`\`

3. Sync the web code to the Android project:
   \`\`\`
   npx cap sync
   \`\`\`

4. Open the project in Android Studio:
   \`\`\`
   npx cap open android
   \`\`\`

5. In Android Studio, you can now build and run the app on an emulator or physical device.

## Creating a Release Build

1. In Android Studio, select Build > Generate Signed Bundle / APK
2. Follow the prompts to create a signed APK or App Bundle
3. Choose the release build variant
4. The APK or App Bundle will be generated in the app/build/outputs directory

## Troubleshooting

- If you encounter build errors, make sure your Android SDK is properly set up
- Check that the capacitor.config.ts file has the correct configuration
- Ensure that all Capacitor plugins are properly installed and configured
- For notification issues, verify that the app has the proper permissions

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Documentation](https://developer.android.com/docs)
