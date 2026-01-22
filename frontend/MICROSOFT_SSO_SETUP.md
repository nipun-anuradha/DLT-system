# Microsoft Entra ID (Azure AD) Setup Guide

## Overview
This guide explains how to set up Microsoft Sign-In for the DLT System using Microsoft Entra ID (formerly Azure AD).

## Prerequisites
- Access to Microsoft Entra Admin Center (https://entra.microsoft.com)
- Admin permissions to create App Registrations

## Step 1: Create App Registration

1. Go to [Microsoft Entra Admin Center](https://entra.microsoft.com)
2. Navigate to **Identity** → **Applications** → **App registrations**
3. Click **+ New registration**
4. Fill in the following:
   - **Name**: `DLT System` (or any name you prefer)
   - **Supported account types**: Select "Accounts in this organizational directory only (Dutch Lanka Trailer Manufacturers Limited only - Single tenant)"
   - **Redirect URI**: 
     - Platform: `Single-page application (SPA)`
     - URL: `http://localhost:5173` (for development)
5. Click **Register**

## Step 2: Get Application (Client) ID

After registration, you'll see the **Overview** page. Copy the following:
- **Application (client) ID**: This is your `clientId` 1221c6ce-0c0f-4353-996a-b4a764d3aee1
- **Directory (tenant) ID**: `33c0b256-5795-4a3c-a551-e6d8d24728f8` (already configured)33c0b256-5795-4a3c-a551-e6d8d24728f8

## Step 3: Configure Redirect URIs

1. Go to **Authentication** in the left menu
2. Under **Single-page application** redirect URIs, add:
   - `http://localhost:5173` (development)
   - `http://localhost:5173/` (with trailing slash)
   - Your production URL when deploying
3. Under **Implicit grant and hybrid flows**, ensure these are **UNCHECKED** (MSAL 2.0 uses auth code flow):
   - Access tokens
   - ID tokens
4. Click **Save**

## Step 4: Configure API Permissions

1. Go to **API permissions** in the left menu
2. Click **+ Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Add the following permissions:
   - `openid` (Sign users in)
   - `profile` (View users' basic profile)
   - `email` (View users' email address)
   - `User.Read` (Sign in and read user profile)
6. Click **Add permissions**
7. Click **Grant admin consent for Dutch Lanka Trailer Manufacturers Limited** (requires admin)

## Step 5: Update Configuration

Open `frontend/src/config/msalConfig.js` and update the `clientId`:

```javascript
export const msalConfig = {
  auth: {
    clientId: "YOUR_CLIENT_ID_HERE", // Replace with your App Registration Client ID
    authority: "https://login.microsoftonline.com/33c0b256-5795-4a3c-a551-e6d8d24728f8",
    redirectUri: window.location.origin,
    // ...
  },
  // ...
};
```

## Step 6: Test the Integration

1. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```
2. Open `http://localhost:5173`
3. Click **"Sign in with Microsoft"** button
4. A popup will appear for Microsoft login
5. After successful login, check the browser console (F12) for user details

## User Details Retrieved

After successful Microsoft sign-in, the following details are fetched from Microsoft Graph API:

| Field | Description | Graph API Property |
|-------|-------------|-------------------|
| Display Name | Full name | `displayName` |
| First Name | Given name | `givenName` |
| Last Name | Surname | `surname` |
| Email | Email address | `mail` or `userPrincipalName` |
| Job Title | Position | `jobTitle` |
| Department | Department name | `department` |
| Office Location | Office phone/location | `officeLocation` |
| Mobile Phone | Mobile number | `mobilePhone` |
| Business Phones | Office phones | `businessPhones` |

## Troubleshooting

### "AADSTS50011: Reply URL does not match"
- Ensure the redirect URI in Azure matches exactly with your app URL
- Include both with and without trailing slash

### "Popup was blocked"
- Allow popups for localhost in browser settings
- Or switch to redirect flow in msalConfig

### "User.Read permission not granted"
- Admin needs to grant consent for the application
- Go to API permissions and click "Grant admin consent"

## Production Deployment

Before deploying to production:
1. Add production URL to redirect URIs in Azure
2. Update `msalConfig.js` if needed
3. Change logger level from `3` (Verbose) to `0` (Error) in production
4. Consider using environment variables for clientId

usermodel | email fetch by
name = displayName
username = email
department = department_id (department)
mobilePhone = mobile
city = branch