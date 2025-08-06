/**
 * JWT Token utility functions
 */

interface JWTPayload {
  exp?: number;
  sub?: string;
  username?: string;
  [key: string]: any;
}

/**
 * Decode a JWT token and return its payload
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if a JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token);
  
  if (!payload || !payload.exp) {
    return true; // Treat invalid or missing exp as expired
  }
  
  // JWT exp is in seconds, JavaScript Date uses milliseconds
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  
  // Add a small buffer (5 seconds) to account for clock skew
  return currentTime >= expirationTime - 5000;
};

/**
 * Get the remaining time until token expiration in milliseconds
 */
export const getTokenExpirationTime = (token: string): number => {
  const payload = decodeToken(token);
  
  if (!payload || !payload.exp) {
    return 0;
  }
  
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  
  return Math.max(0, expirationTime - currentTime);
};

/**
 * Get user information from token
 */
export const getUserFromToken = (token: string): { username: string } | null => {
  const payload = decodeToken(token);
  
  if (!payload) {
    return null;
  }
  
  return {
    username: payload.sub || payload.username || 'Unknown',
  };
};

/**
 * Set up automatic token refresh before expiration
 */
export const setupTokenRefreshTimer = (
  token: string,
  refreshCallback: () => Promise<void>
): ReturnType<typeof setTimeout> | null => {
  const timeUntilExpiration = getTokenExpirationTime(token);
  
  if (timeUntilExpiration <= 0) {
    return null;
  }
  
  // Refresh 5 minutes before expiration, or at 80% of token lifetime (whichever is sooner)
  const refreshTime = Math.min(
    timeUntilExpiration - 5 * 60 * 1000, // 5 minutes before expiration
    timeUntilExpiration * 0.8 // 80% of token lifetime
  );
  
  if (refreshTime <= 0) {
    // Token expires too soon, refresh immediately
    refreshCallback();
    return null;
  }
  
  return setTimeout(() => {
    refreshCallback();
  }, refreshTime);
};