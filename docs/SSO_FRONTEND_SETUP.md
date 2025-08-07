# SSO Frontend Setup Guide

## Overview

The frontend SSO integration uses Microsoft Authentication Library (MSAL) for browser-based authentication with Azure AD/Entra ID. This implementation supports both SSO and local authentication modes.

## Components Added

### 1. Core Configuration
- **`src/config/msalConfig.ts`**: MSAL configuration and initialization
- **`.env.sso.example`**: Example environment configuration for SSO

### 2. Authentication Components
- **`src/components/SSOLoginButton.tsx`**: SSO login button component
- **`src/components/SSOCallback.tsx`**: OAuth2 callback handler
- **`src/providers/MsalProvider.tsx`**: MSAL provider wrapper

### 3. Hooks and Services
- **`src/hooks/useMsalAuth.ts`**: Custom hook for MSAL authentication
- **`src/services/authApi.ts`**: Authentication API service with SSO support

### 4. Updated Components
- **`src/contexts/AuthContext.tsx`**: Enhanced with SSO support
- **`src/pages/LoginScreen.tsx`**: Updated to show SSO login option
- **`src/App.tsx`**: Added SSO callback routes and MSAL provider

## Configuration

### 1. Environment Variables

Copy `.env.sso.example` to `.env.local` and configure:

```env
# Azure AD Configuration
VITE_AZURE_TENANT_ID=your-tenant-id
VITE_AZURE_CLIENT_ID=your-client-id
VITE_SSO_REDIRECT_URI=http://localhost:5173/callback

# Feature Flag
VITE_ENABLE_SSO=true
```

### 2. Azure AD App Registration

In Azure Portal:

1. Register a new application
2. Set redirect URI: `http://localhost:5173/callback` (for development)
3. Enable ID tokens and access tokens
4. Configure API permissions (User.Read minimum)
5. Note the Tenant ID and Client ID

## Authentication Flow

### SSO Login Flow

1. User clicks "Sign in with Microsoft" button
2. Browser redirects to Azure AD login page
3. User authenticates with corporate credentials
4. Azure AD redirects back to `/callback` with tokens
5. Frontend exchanges Azure tokens for backend JWT
6. User is authenticated and redirected to app

### Dual Authentication Support

The system supports both SSO and local authentication:

- **SSO Only**: Disable local auth in backend config
- **Local Only**: Don't configure SSO environment variables
- **Both**: Users can choose either authentication method

## Key Features

### 1. PKCE Flow
- Uses Authorization Code flow with PKCE
- No client secret needed in frontend
- Secure for SPA applications

### 2. Token Management
- Automatic token refresh
- Silent token acquisition
- Secure token storage in localStorage

### 3. Session Management
- SSO session persistence
- Automatic logout from Azure AD
- Clean session cleanup

### 4. Error Handling
- Graceful fallback for SSO failures
- Clear error messages
- Redirect to login on errors

## Testing SSO Integration

### 1. Local Testing

```bash
# Start backend with SSO config
cd ../Crosslake-Credentials-App-backend
./start-local.sh

# Start frontend
cd ../Crosslake-Credentials-App-frontend
npm run dev
```

### 2. Test Scenarios

1. **SSO Login**: Click "Sign in with Microsoft"
2. **Token Refresh**: Wait for token expiry
3. **Logout**: Test SSO logout flow
4. **Error Handling**: Test with invalid config
5. **Dual Auth**: Test both SSO and local login

### 3. Verification Points

- SSO button appears when configured
- Redirect to Azure AD works
- Callback handles tokens correctly
- Backend exchange succeeds
- User session established
- Protected routes accessible

## Troubleshooting

### Common Issues

1. **SSO Button Not Appearing**
   - Check VITE_AZURE_TENANT_ID and VITE_AZURE_CLIENT_ID are set
   - Verify backend SSO config endpoint returns enabled=true

2. **Redirect URI Mismatch**
   - Ensure redirect URI in Azure AD matches VITE_SSO_REDIRECT_URI
   - Check for trailing slashes

3. **Token Exchange Fails**
   - Verify backend /api/v1/auth/sso/exchange endpoint exists
   - Check CORS configuration

4. **MSAL Errors**
   - Check browser console for detailed MSAL logs
   - Verify Azure AD app permissions

## Security Considerations

1. **Token Storage**: Tokens stored in localStorage (consider sessionStorage for higher security)
2. **PKCE**: Always use PKCE flow for SPAs
3. **CORS**: Configure strict CORS policies
4. **HTTPS**: Use HTTPS in production
5. **Token Validation**: Backend should validate Azure AD tokens

## Next Steps

1. Configure Azure AD application
2. Set environment variables
3. Test SSO login flow
4. Deploy to staging environment
5. Configure production redirect URIs