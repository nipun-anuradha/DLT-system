// Microsoft Graph API Service
// Fetches user details from Microsoft Graph API after authentication

import { graphConfig } from '../config/msalConfig';

/**
 * Fetch user profile from Microsoft Graph API
 * @param {string} accessToken - The access token from MSAL
 * @returns {Promise<Object>} User profile data from Microsoft Graph
 */
export async function fetchMsGraphProfile(accessToken) {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${accessToken}`);
  headers.append("Content-Type", "application/json");

  const options = {
    method: "GET",
    headers: headers,
  };

  try {
    const response = await fetch(graphConfig.graphMeEndpoint, options);
    
    if (!response.ok) {
      throw new Error(`Graph API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching Microsoft Graph profile:", error);
    throw error;
  }
}

/**
 * Format and log all Microsoft user details
 * @param {Object} msalAccount - MSAL account object
 * @param {Object} graphProfile - Microsoft Graph profile data
 */
export function logMicrosoftUserDetails(msalAccount, graphProfile) {
  console.group("🔐 Microsoft Sign-In - User Details");
  
  console.group("📧 MSAL Account Info");
  console.log("Username:", msalAccount?.username);
  console.log("Name:", msalAccount?.name);
  console.log("Local Account ID:", msalAccount?.localAccountId);
  console.log("Tenant ID:", msalAccount?.tenantId);
  console.log("Home Account ID:", msalAccount?.homeAccountId);
  console.log("Environment:", msalAccount?.environment);
  console.groupEnd();
  
  console.group("👤 Microsoft Graph Profile");
  console.log("ID:", graphProfile?.id);
  console.log("Display Name:", graphProfile?.displayName);
  console.log("Given Name (First):", graphProfile?.givenName);
  console.log("Surname (Last):", graphProfile?.surname);
  console.log("Email:", graphProfile?.mail || graphProfile?.userPrincipalName);
  console.log("User Principal Name:", graphProfile?.userPrincipalName);
  console.log("Job Title:", graphProfile?.jobTitle);
  console.log("Department:", graphProfile?.department);
  console.log("Office Location:", graphProfile?.officeLocation);
  console.log("City:", graphProfile?.city);
  console.log("Mobile Phone:", graphProfile?.mobilePhone);
  console.log("Business Phones:", graphProfile?.businessPhones);
  console.log("Preferred Language:", graphProfile?.preferredLanguage);
  console.groupEnd();
  
  console.group("📋 Complete Raw Data");
  console.log("MSAL Account:", msalAccount);
  console.log("Graph Profile:", graphProfile);
  console.groupEnd();
  
  console.groupEnd();
  
  return {
    // Mapped data for potential registration
    microsoftId: graphProfile?.id,
    email: graphProfile?.mail || graphProfile?.userPrincipalName,
    displayName: graphProfile?.displayName,
    firstName: graphProfile?.givenName,
    lastName: graphProfile?.surname,
    jobTitle: graphProfile?.jobTitle,
    department: graphProfile?.department,
    officeLocation: graphProfile?.officeLocation,
    city: graphProfile?.city, // City from MS - used as branch
    mobilePhone: graphProfile?.mobilePhone,
    businessPhones: graphProfile?.businessPhones,
  };
}
