# Setting Up Google Calendar API Integration

This guide will walk you through the process of setting up Google Calendar API for your Productivity App.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a project" at the top of the page
3. Click on "NEW PROJECT" in the popup
4. Enter a name for your project (e.g., "Productivity App Calendar")
5. Click "CREATE"

## Step 2: Enable the Google Calendar API

1. In your new project, go to the Navigation menu (hamburger icon) and select "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on "Google Calendar API" in the results
4. Click "ENABLE"

## Step 3: Configure the OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you have a Google Workspace)
3. Fill in the required information:
   - App name: "Productivity App" (or your preferred name)
   - User support email: Your email address
   - Developer contact information: Your email address
4. Click "SAVE AND CONTINUE"
5. On the Scopes page, click "ADD OR REMOVE SCOPES"
6. Search for and select "https://www.googleapis.com/auth/calendar" (Calendar API v3)
7. Click "UPDATE"
8. Click "SAVE AND CONTINUE"
9. On the Test users page, click "ADD USERS"
10. Add your Google email address as a test user (e.g., msonithokozile@gmail.com)
11. Click "SAVE AND CONTINUE"
12. Review your settings and click "BACK TO DASHBOARD"

## Step 4: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "CREATE CREDENTIALS" and select "OAuth client ID"
3. For application type, select "Web application"
4. Name your OAuth client (e.g., "Productivity App Web Client")
5. Under "Authorized JavaScript origins", click "ADD URI" and add:
   - For development: `http://localhost:3000`
   - For production: Your actual domain (e.g., `https://v0-recreate-figma-ui-9e.vercel.app`)
6. Under "Authorized redirect URIs", click "ADD URI" and add:
   - For development: `http://localhost:3000`
   - For production: Your actual domain (e.g., `https://v0-recreate-figma-ui-9e.vercel.app`)
7. Click "CREATE"
8. A popup will show your Client ID and Client Secret. Copy the Client ID (you don't need the Client Secret for this integration)

## Step 5: Add Credentials to Your App

1. Go to your Vercel project settings
2. Navigate to the "Environment Variables" section
3. Add a new environment variable:
   - Name: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - Value: Your Google Client ID (e.g., `123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`)
4. Click "Save"
5. Redeploy your application to apply the new environment variable

## Step 6: Test the Integration

1. Open your app and go to Settings
2. Click on "Google Calendar"
3. Click "Connect" and follow the Google authentication flow
4. Try syncing events between your app and Google Calendar

## Troubleshooting

### "Error 401: invalid_client" or "The OAuth client was not found"

This error typically occurs when there's a mismatch between your OAuth configuration and how your application is trying to use it. Try these steps:

1. **Verify your Client ID**: Make sure the Client ID in your Vercel environment variables exactly matches the one from Google Cloud Console
2. **Check JavaScript Origins**: Ensure the domain where your app is running is listed in "Authorized JavaScript origins"
   - For your app, this should be: `https://v0-recreate-figma-ui-9e.vercel.app`
3. **Check Redirect URIs**: Ensure the domain where your app is running is listed in "Authorized redirect URIs"
   - For your app, this should be: `https://v0-recreate-figma-ui-9e.vercel.app`
4. **Verify OAuth Consent Screen**: Make sure you've added the Calendar API scope and your email as a test user
5. **Check for Typos**: Ensure there are no extra spaces or characters in your Client ID
6. **Clear Browser Cache**: Try clearing your browser cache and cookies
7. **Try Incognito Mode**: Test the integration in an incognito/private browsing window
8. **Check Project Status**: Make sure your Google Cloud project is not disabled or in a pending state

### Other Common Issues

- If events aren't syncing, check the browser console for errors
- Make sure you've enabled the Google Calendar API in your Google Cloud project
- Verify that you've added the correct scopes to your OAuth consent screen

## Security Notes

- Never commit your environment variables to version control
- For production, set your environment variables in your hosting platform (e.g., Vercel)
