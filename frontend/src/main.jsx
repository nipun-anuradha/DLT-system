import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PublicClientApplication, EventType } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import { msalConfig } from './config/msalConfig'
import './index.css'
import App from './App.jsx'

console.log("Secure Context:", window.isSecureContext);
console.log("Crypto:", window.crypto);
console.log("Crypto subtle:", window.crypto?.subtle);
console.log("Redirect URL:", import.meta.env.VITE_REDIRECT_URL);


// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Default to using the first account if available
const initializeMsal = async () => {
  await msalInstance.initialize();
  
  // Handle redirect/popup response (IMPORTANT: must be called before rendering)
  try {
    const response = await msalInstance.handleRedirectPromise();
    if (response) {
      console.log("✅ MSAL Auth Response received:", response);
      msalInstance.setActiveAccount(response.account);
    }
  } catch (error) {
    console.error("MSAL handleRedirectPromise error:", error);
  }

  // Check if there are existing accounts
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
  }

  // Listen for sign-in events
  msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const account = event.payload.account;
      msalInstance.setActiveAccount(account);
      console.log("✅ Login success, active account set:", account);
    }
  });

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </StrictMode>,
  );
};

initializeMsal().catch(console.error);
