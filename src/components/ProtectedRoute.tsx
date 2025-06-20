
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { Loading } from '@/components/ui/loading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const { user, isLoading, isInitialized, refreshUser } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute Debug:', {
    user: user ? { id: user.id, email: user.email, role: user.role } : null,
    requiredRole,
    allowedRoles,
    isLoading,
    isInitialized,
    currentPath: location.pathname
  });

  // Show loading while auth is initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if authentication is required and user is not logged in
  if (requireAuth && !user) {
    console.log('ProtectedRoute - Redirecting to auth: no user found');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (user && (requiredRole || allowedRoles)) {
    const userRole = user.role as UserRole;
    const hasAccess = requiredRole 
      ? userRole === requiredRole
      : allowedRoles?.includes(userRole);

    console.log('ProtectedRoute - Access check:', {
      userRole,
      hasAccess,
      requiredRole,
      allowedRoles
    });

    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4" />
                    <p className="font-semibold">Access Denied</p>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>You don't have permission to access this page.</p>
                    <p><strong>Required:</strong> {requiredRole || allowedRoles?.join(', ')}</p>
                    <p><strong>Your role:</strong> {user.role}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refreshUser()}
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Refresh
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => window.location.href = '/'}
                    >
                      Go Home
                    </Button>
                  </div>
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
