import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  CreditCard, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Award
} from 'lucide-react';
import BankingDetailsForm from './BankingDetailsForm';

interface DocumentUpload {
  type: string;
  name: string;
  file: File | null;
  required: boolean;
}

export const ProviderVerificationForm: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingCertificate, setIsCheckingCertificate] = useState(true);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [documents, setDocuments] = useState<DocumentUpload[]>([
    { type: 'identity_document', name: 'ID Document', file: null, required: true },
    { type: 'proof_of_residence', name: 'Proof of Residence', file: null, required: true },
    { type: 'police_clearance', name: 'Police Clearance', file: null, required: true },
    { type: 'qualification_certificate', name: 'Qualification Certificate', file: null, required: false },
    { type: 'insurance_certificate', name: 'Insurance Certificate', file: null, required: false },
  ]);
  const [bankingComplete, setBankingComplete] = useState(false);

  // Check if provider category is set on component mount
  useEffect(() => {
    if (user && user.role === 'provider' && !user.provider_category) {
      console.log('Provider category not set, redirecting to profile');
      navigate('/provider-profile', { 
        state: { 
          message: 'Please set your provider category before starting verification',
          highlightCategory: true,
          from: 'verification'
        }
      });
    }
  }, [user, navigate]);

  // Check for Longa Academy certificate completion
  useEffect(() => {
    const checkCertificate = async () => {
      if (!user?.provider_category) return;

      setIsCheckingCertificate(true);
      try {
        const { data: certificate, error } = await supabase
          .from('provider_certificates')
          .select('*')
          .eq('provider_id', user.id)
          .eq('service_type', user.provider_category)
          .eq('is_active', true)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking certificate:', error);
        }

        setHasCertificate(!!certificate);
      } catch (error) {
        console.error('Error checking certificate:', error);
        setHasCertificate(false);
      } finally {
        setIsCheckingCertificate(false);
      }
    };

    if (user?.provider_category) {
      checkCertificate();
    }
  }, [user]);

  // Show error if no provider category
  if (!user?.provider_category) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>Provider category not set. Please update your profile first.</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/provider-profile', {
                  state: { 
                    message: 'Please set your provider category to continue',
                    highlightCategory: true,
                    from: 'verification'
                  }
                })}
              >
                Go to Profile
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show loading while checking certificate
  if (isCheckingCertificate) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Checking academy completion status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show academy requirement if no certificate
  if (!hasCertificate) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <BookOpen className="h-5 w-5" />
              Academy Training Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-yellow-300 bg-yellow-100">
              <Award className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Training Required:</strong> You must complete your Longa Academy mini-course for {user.provider_category?.replace('_', ' ')} services before uploading verification documents.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">What you'll learn:</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>Service standards and quality expectations</li>
                <li>Safety protocols and best practices</li>
                <li>Customer service guidelines</li>
                <li>Platform policies and procedures</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">After completing the course:</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>Pass the mini-quiz (80% minimum score)</li>
                <li>Receive your Longa Academy Certificate</li>
                <li>Return here to upload your documents</li>
              </ul>
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={() => navigate('/provider-profile', {
                  state: { 
                    message: 'Please complete your academy training first',
                    from: 'verification'
                  }
                })}
                className="w-full"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Go to Longa Academy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFileUpload = (documentType: string, file: File) => {
    setDocuments(docs => docs.map(doc => 
      doc.type === documentType ? { ...doc, file } : doc
    ));
  };

  const uploadDocument = async (file: File, documentType: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${documentType}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { error: dbError } = await supabase
      .from('provider_documents')
      .insert({
        provider_id: user?.id,
        document_type: documentType,
        document_name: file.name,
        file_path: fileName,
        mime_type: file.type,
        file_size: file.size,
        verification_status: 'pending'
      });

    if (dbError) throw dbError;
  };

  const handleBankingSave = async (bankingData: any) => {
    console.log('Saving banking data:', bankingData);
    setBankingComplete(true);
  };

  const handleSubmit = async () => {
    if (!user?.provider_category) {
      toast({
        title: "Error",
        description: "Provider category is required. Please update your profile first.",
        variant: "destructive",
      });
      navigate('/provider-profile', {
        state: { 
          message: 'Please set your provider category to continue',
          highlightCategory: true,
          from: 'verification'
        }
      });
      return;
    }

    if (!bankingComplete) {
      toast({
        title: "Banking Details Required",
        description: "Please complete your banking details before submitting verification.",
        variant: "destructive",
      });
      return;
    }

    const requiredDocs = documents.filter(doc => doc.required);
    const missingDocs = requiredDocs.filter(doc => !doc.file);

    if (missingDocs.length > 0) {
      toast({
        title: "Missing Documents",
        description: `Please upload: ${missingDocs.map(doc => doc.name).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Upload all documents
      const uploadPromises = documents
        .filter(doc => doc.file)
        .map(doc => uploadDocument(doc.file!, doc.type));

      await Promise.all(uploadPromises);

      // Update user verification status
      const { error: updateError } = await supabase
        .from('users')
        .update({
          verification_status: 'under_review',
          verification_submitted_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      await refreshUser();

      toast({
        title: "Verification Submitted",
        description: "Your verification has been submitted successfully. We'll review it within 2-3 business days.",
      });

      navigate('/provider-dashboard');

    } catch (error: any) {
      console.error('Verification submission error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Provider Verification</h1>
        <p className="text-gray-600">
          Complete verification for {user.provider_category?.replace('_', ' ')} services
        </p>
      </div>

      {/* Academy Completion Status */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Longa Academy Training Completed</p>
              <p className="text-sm text-green-700">
                You have successfully completed your academy training and earned your certificate.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Steps */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
            ✓
          </div>
          <span className="ml-2 text-sm font-medium text-green-600">Academy</span>
        </div>
        <div className="w-16 h-0.5 bg-green-300"></div>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
            2
          </div>
          <span className="ml-2 text-sm font-medium text-blue-600">Documents</span>
        </div>
        <div className="w-16 h-0.5 bg-gray-300"></div>
        <div className="flex items-center">
          <div className={`w-8 h-8 ${bankingComplete ? 'bg-green-600' : 'bg-gray-300'} text-white rounded-full flex items-center justify-center text-sm font-medium`}>
            3
          </div>
          <span className={`ml-2 text-sm font-medium ${bankingComplete ? 'text-green-600' : 'text-gray-500'}`}>
            Banking
          </span>
        </div>
        <div className="w-16 h-0.5 bg-gray-300"></div>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-medium">
            4
          </div>
          <span className="ml-2 text-sm font-medium text-gray-500">Review</span>
        </div>
      </div>

      {/* Document Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Required Documents
          </CardTitle>
          <p className="text-sm text-gray-600">
            Upload the following documents. Your Longa Academy Certificate will be automatically included.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.type} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="font-medium">{doc.name}</Label>
                {doc.required && (
                  <span className="text-sm text-red-500">Required</span>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(doc.type, file);
                  }}
                  className="flex-1"
                />
                {doc.file && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Ready</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Banking Details Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Banking Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BankingDetailsForm onSave={handleBankingSave} />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={isLoading}
          size="lg"
          className="min-w-[200px]"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Submit Verification
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
