/**
 * MSAL Provider Wrapper
 * Initializes and provides MSAL context to the application
 */

import React, { useEffect, useState } from 'react';
import { MsalProvider as BaseMsalProvider } from '@azure/msal-react';
import type { EventMessage } from '@azure/msal-browser';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { msalConfig, isSSOConfigured } from '../config/msalConfig';

interface MsalProviderWrapperProps {
  children: React.ReactNode;
}

const MsalProviderWrapper: React.FC<MsalProviderWrapperProps> = ({ children }) => {
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeMsal = async () => {
      // Only initialize MSAL if SSO is configured
      if (!isSSOConfigured()) {
        setIsInitialized(true);
        return;
      }

      try {
        const instance = new PublicClientApplication(msalConfig);
        await instance.initialize();

        // Set up event callbacks
        instance.addEventCallback((event: EventMessage) => {
          switch (event.eventType) {
            case EventType.LOGIN_SUCCESS:
              console.log('MSAL login success:', event);
              break;
            case EventType.LOGIN_FAILURE:
              console.error('MSAL login failure:', event);
              break;
            case EventType.LOGOUT_SUCCESS:
              console.log('MSAL logout success');
              break;
            case EventType.ACQUIRE_TOKEN_SUCCESS:
              console.log('MSAL token acquired');
              break;
            case EventType.ACQUIRE_TOKEN_FAILURE:
              console.error('MSAL token acquisition failed:', event);
              break;
            default:
              break;
          }
        });

        // Handle redirect promise if returning from Azure AD
        try {
          const response = await instance.handleRedirectPromise();
          if (response) {
            console.log('Redirect response:', response);
            // The response will be handled by the SSOCallback component
          }
        } catch (error) {
          console.error('Error handling redirect:', error);
        }

        setMsalInstance(instance);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize MSAL:', error);
        setIsInitialized(true); // Still set as initialized to prevent blocking
      }
    };

    initializeMsal();
  }, []);

  // If SSO is not configured or MSAL is not yet initialized, render children directly
  if (!isSSOConfigured() || !isInitialized) {
    return <>{children}</>;
  }

  // If MSAL instance is not available (initialization failed), render children directly
  if (!msalInstance) {
    return <>{children}</>;
  }

  // Wrap children with MSAL provider
  return (
    <BaseMsalProvider instance={msalInstance}>
      {children}
    </BaseMsalProvider>
  );
};

export default MsalProviderWrapper;