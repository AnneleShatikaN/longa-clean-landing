
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, Shield, Cookie, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';
import { ConfirmationDialog, useConfirmation } from '@/components/ConfirmationDialog';

interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

interface DataRetentionPolicy {
  userProfiles: number; // days
  bookingHistory: number;
  paymentRecords: number;
  communicationLogs: number;
}

const NAMIBIAN_DATA_RETENTION: DataRetentionPolicy = {
  userProfiles: 2555, // 7 years as per Namibian business requirements
  bookingHistory: 1825, // 5 years
  paymentRecords: 2555, // 7 years for tax purposes
  communicationLogs: 365 // 1 year
};

export const PrivacyManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useEnhancedToast();
  const { confirm, ConfirmationComponent } = useConfirmation();
  
  const [cookieConsent, setCookieConsent] = useState<CookieConsent>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false
  });

  const [dataExportLoading, setDataExportLoading] = useState(false);
  const [accountDeletionLoading, setAccountDeletionLoading] = useState(false);

  useEffect(() => {
    // Load cookie preferences
    const savedConsent = localStorage.getItem('longa_cookie_consent');
    if (savedConsent) {
      setCookieConsent(JSON.parse(savedConsent));
    }
  }, []);

  const handleCookieConsentChange = (type: keyof CookieConsent, value: boolean) => {
    if (type === 'necessary') return; // Can't disable necessary cookies
    
    const newConsent = { ...cookieConsent, [type]: value };
    setCookieConsent(newConsent);
    localStorage.setItem('longa_cookie_consent', JSON.stringify(newConsent));
    
    toast.success('Cookie Preferences Updated', 'Your privacy settings have been saved');
  };

  const exportUserData = async () => {
    if (!user) return;

    const confirmed = await confirm({
      title: 'Export Your Data',
      description: 'This will generate a complete export of all your personal data stored in our system. The download will begin shortly.',
      confirmText: 'Export Data',
      icon: Download
    });

    if (!confirmed) return;

    setDataExportLoading(true);
    
    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would generate and download a comprehensive data export
      const exportData = {
        user: user,
        bookings: JSON.parse(localStorage.getItem('longa_bookings') || '[]'),
        preferences: JSON.parse(localStorage.getItem('longa_user_preferences') || '{}'),
        exportDate: new Date().toISOString(),
        dataRetentionPolicy: NAMIBIAN_DATA_RETENTION
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `longa-data-export-${user.id}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data Export Complete', 'Your data has been downloaded successfully');
    } catch (error) {
      toast.error('Export Failed', 'Unable to export your data. Please try again later.');
    } finally {
      setDataExportLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;

    const confirmed = await confirm({
      title: 'Delete Account',
      description: 'This action is irreversible. All your data including bookings, preferences, and account information will be permanently deleted within 30 days as per Namibian data protection requirements.',
      confirmText: 'Delete My Account',
      variant: 'destructive',
      icon: Trash2
    });

    if (!confirmed) return;

    setAccountDeletionLoading(true);
    
    try {
      // Simulate account deletion process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would initiate the account deletion process
      toast.success('Account Deletion Initiated', 'Your account will be deleted within 30 days. You can cancel this request by contacting support.');
      
      // Log out the user
      // logout(); // Uncomment when ready to implement
    } catch (error) {
      toast.error('Deletion Failed', 'Unable to process account deletion. Please contact support.');
    } finally {
      setAccountDeletionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmationComponent />
      
      {/* Cookie Consent Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cookie className="h-5 w-5 mr-2" />
            Cookie Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Necessary Cookies</div>
                <div className="text-sm text-gray-600">Required for basic functionality</div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={true} disabled />
                <Badge variant="secondary">Required</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Analytics Cookies</div>
                <div className="text-sm text-gray-600">Help us improve the service</div>
              </div>
              <Switch 
                checked={cookieConsent.analytics}
                onCheckedChange={(value) => handleCookieConsentChange('analytics', value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Marketing Cookies</div>
                <div className="text-sm text-gray-600">For personalized offers and promotions</div>
              </div>
              <Switch 
                checked={cookieConsent.marketing}
                onCheckedChange={(value) => handleCookieConsentChange('marketing', value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Preference Cookies</div>
                <div className="text-sm text-gray-600">Remember your settings and preferences</div>
              </div>
              <Switch 
                checked={cookieConsent.preferences}
                onCheckedChange={(value) => handleCookieConsentChange('preferences', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Your Data Rights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={exportUserData}
              disabled={dataExportLoading}
              className="h-auto p-4 text-left"
            >
              <div>
                <div className="font-medium flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Export My Data
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Download all your personal data
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={deleteAccount}
              disabled={accountDeletionLoading}
              className="h-auto p-4 text-left border-red-200 hover:border-red-300"
            >
              <div>
                <div className="font-medium flex items-center text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Permanently delete your account
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Data Retention Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>User Profiles:</span>
              <span>{Math.floor(NAMIBIAN_DATA_RETENTION.userProfiles / 365)} years</span>
            </div>
            <div className="flex justify-between">
              <span>Booking History:</span>
              <span>{Math.floor(NAMIBIAN_DATA_RETENTION.bookingHistory / 365)} years</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Records:</span>
              <span>{Math.floor(NAMIBIAN_DATA_RETENTION.paymentRecords / 365)} years</span>
            </div>
            <div className="flex justify-between">
              <span>Communication Logs:</span>
              <span>{Math.floor(NAMIBIAN_DATA_RETENTION.communicationLogs / 365)} year</span>
            </div>
            <div className="text-xs text-gray-600 mt-4 p-3 bg-gray-50 rounded">
              Data retention periods comply with Namibian business and tax regulations. 
              Some data may be retained longer if required by law.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
