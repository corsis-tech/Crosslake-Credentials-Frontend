import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to handle authentication redirects
 * Redirects to login if not authenticated, or to intended destination after login
 */
export const useAuthRedirect = (requireAuth: boolean = true) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // Redirect to login with return path
        navigate('/login', { state: { from: location }, replace: true });
      } else if (!requireAuth && isAuthenticated && location.pathname === '/login') {
        // If already authenticated and on login page, redirect to home
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, navigate, location]);

  return { isAuthenticated, isLoading };
};