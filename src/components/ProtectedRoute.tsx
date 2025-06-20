
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { Loading } from '@/components/ui/loading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
  requireAuth = true
}) => {
  const { user, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - RequiredRole:', requiredRole);
  console.log('ProtectedRoute - AllowedRoles:', allowedRoles);
  console.log('ProtectedRoute - UserRole:', user?.role);

  // Show loading while auth is initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  // Redirect to auth if authentication is required and user is not logged in
  if (requireAuth && !user) {
    console.log('ProtectedRoute - Redirecting to auth, no user');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (user && (requiredRole || allowedRoles)) {
    const userRole = user.role as UserRole;
    const hasAccess = requiredRole 
      ? userRole === requiredRole
      : allowedRoles?.includes(userRole);

    console.log('ProtectedRoute - Has access:', hasAccess);

    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <Shield className="h-4 w-4" />
              <AlertDescription className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <div>
                  <p className="font-semibold">Access Denied</p>
                  <p className="text-sm">
                    You don't have permission to access this page. 
                    Required role: {requiredRole || allowedRoles?.join(', ')}
                    Your role: {user.role}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
