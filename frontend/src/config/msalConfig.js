// Microsoft Authentication Library (MSAL) Configuration
// For Microsoft Entra ID (Azure AD) authentication

export const msalConfig = {
  auth: {
    // Replace with your App Registration Client ID from Azure Portal
    clientId: import.meta.env.ENTRA_CLIENT_ID,
    
    // Replace with your tenant ID or use 'common' for multi-tenant
    // Your tenant ID: 33c0b256-5795-4a3c-a551-e6d8d24728f8
    authority: "https://login.microsoftonline.com/33c0b256-5795-4a3c-a551-e6d8d24728f8",
    
    // Redirect URI - must match the one configured in Azure Portal
    // redirectUri: "http://localhost:5173",
    redirectUri: import.meta.env.ENTRA_REDIRECT_URI,
    
    // Post logout redirect
    // postLogoutRedirectUri: "http://localhost:5173",
    postLogoutRedirectUri: import.meta.env.ENTRA_REDIRECT_URI,
    
    // Navigate to request URL after login
    navigateToLoginRequestUrl: false,
  },
  cache: {
    // Recommended for SPAs
    cacheLocation: "sessionStorage",
    
    // Set to true for IE11 or Edge
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case 0: // Error
            console.error(message);
            return;
          case 1: // Warning
            console.warn(message);
            return;
          case 2: // Info
            // console.info(message); // Commented out to reduce noise
            return;
          case 3: // Verbose
            // console.debug(message); // Commented out to reduce noise
            return;
          default:
            return;
        }
      },
      logLevel: 2, // Info level for debugging
    },
  },
};

// Scopes for Microsoft Graph API
export const loginRequest = {
  scopes: [
    "openid",
    "profile",
    "email",
    "User.Read", // Read user profile
  ],
};

// Scopes for getting additional user details from Graph API
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me?$select=id,displayName,givenName,surname,mail,userPrincipalName,jobTitle,department,officeLocation,mobilePhone,businessPhones,preferredLanguage,city,state,country,postalCode,streetAddress",
};
