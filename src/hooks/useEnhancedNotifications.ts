
import { toast } from 'sonner';
import { CheckCircle, AlertTriangle, XCircle, Info, Package, CreditCard, User, Calendar } from 'lucide-react';

export const useEnhancedNotifications = () => {
  const showSuccess = (title: string, description?: string, action?: () => void) => {
    toast.success(title, {
      description,
      action: action ? {
        label: 'View',
        onClick: action
      } : undefined,
      duration: 5000,
    });
  };

  const showError = (title: string, description?: string, action?: () => void) => {
    toast.error(title, {
      description,
      action: action ? {
        label: 'Retry',
        onClick: action
      } : undefined,
      duration: 7000,
    });
  };

  const showWarning = (title: string, description?: string) => {
    toast.warning(title, {
      description,
      duration: 6000,
    });
  };

  const showInfo = (title: string, description?: string) => {
    toast.info(title, {
      description,
      duration: 4000,
    });
  };

  // Specific notification types
  const notifyBookingSuccess = (serviceName: string) => {
    showSuccess(
      'Booking Confirmed!',
      `Your ${serviceName} service has been booked successfully. You'll receive confirmation details shortly.`,
      () => window.location.href = '/client-dashboard'
    );
  };

  const notifyPackagePurchase = (packageName: string) => {
    showSuccess(
      'Package Purchase Submitted!',
      `Your ${packageName} purchase is being processed. We'll activate it within 24 hours.`,
      () => window.location.href = '/client-dashboard'
    );
  };

  const notifyEmailVerification = () => {
    showInfo(
      'Email Verification Required',
      'Please check your email and click the verification link to access all features.'
    );
  };

  const notifyServiceError = () => {
    showError(
      'Service Unavailable',
      'Unable to load services. Please check your connection and try again.',
      () => window.location.reload()
    );
  };

  const notifyPaymentInstructions = () => {
    showInfo(
      'Payment Instructions Sent',
      'Banking details have been provided. Please complete your payment and send proof via WhatsApp.'
    );
  };

  const notifyAccountUpdate = () => {
    showSuccess(
      'Account Updated',
      'Your profile information has been saved successfully.'
    );
  };

  const notifyServiceComplete = (serviceName: string) => {
    showSuccess(
      'Service Completed!',
      `Your ${serviceName} service has been completed. Please rate your experience.`,
      () => toast.info('Rating', { description: 'Please rate your service provider' })
    );
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    notifyBookingSuccess,
    notifyPackagePurchase,
    notifyEmailVerification,
    notifyServiceError,
    notifyPaymentInstructions,
    notifyAccountUpdate,
    notifyServiceComplete
  };
};
