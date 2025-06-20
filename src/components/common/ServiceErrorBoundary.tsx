
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ServiceErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ServiceErrorBoundaryClass extends React.Component<
  ServiceErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ServiceErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ServiceErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const resetError = () => {
        this.setState({ hasError: false, error: null });
      };

      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error!} resetError={resetError} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({
  error,
  resetError
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 mb-4">
            We encountered an error while loading this page. This might be due to a network issue or missing data.
          </p>
          <div className="text-sm text-red-600 bg-red-100 p-3 rounded mb-4 font-mono">
            {error.message}
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              onClick={resetError}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/services')}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Services
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ServiceErrorBoundary: React.FC<ServiceErrorBoundaryProps> = (props) => {
  return <ServiceErrorBoundaryClass {...props} />;
};
