
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, FileText } from 'lucide-react';

export const ProviderVerificationForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Document upload state - only two documents needed
  const [documents, setDocuments] = useState({
    national_id: null as File | null,
    police_clearance: null as File | null
  });

  const [backgroundCheckConsent, setBackgroundCheckConsent] = useState(false);

  const handleFileUpload = (docType: keyof typeof documents, file: File) => {
    setDocuments(prev => ({ ...prev, [docType]: file }));
  };

  const uploadDocument = async (file: File, docType: string) => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${docType}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Save document record
    const { error: dbError } = await supabase
      .from('provider_documents')
      .insert({
        provider_id: user.id,
        document_type: docType,
        document_name: file.name,
        file_path: fileName,
        file_size: file.size,
        mime_type: file.type
      });

    if (dbError) throw dbError;
    return fileName;
  };

  const handleSubmitVerification = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Upload documents
      const documentPromises = Object.entries(documents)
        .filter(([_, file]) => file !== null)
        .map(([type, file]) => uploadDocument(file!, type));

      await Promise.all(documentPromises);

      // Update user verification status
      await supabase.from('users').update({
        verification_status: 'under_review',
        verification_submitted_at: new Date().toISOString(),
        background_check_consent: backgroundCheckConsent
      }).eq('id', user.id);

      toast({
        title: "Verification Submitted",
        description: "Your verification application has been submitted and is under review.",
      });

      // Refresh the page to show new status
      window.location.reload();

    } catch (error) {
      console.error('Verification submission error:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit verification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    const hasRequiredDocuments = documents.national_id && documents.police_clearance;
    return hasRequiredDocuments && backgroundCheckConsent;
  };

  const handleConsentChange = (checked: boolean | "indeterminate") => {
    setBackgroundCheckConsent(checked === true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Provider Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-gray-600 mb-4">
            <p>To become a verified provider, please upload the following two documents:</p>
          </div>

          {/* Required Documents */}
          <div className="space-y-4">
            {Object.entries({
              national_id: 'Valid ID or Passport',
              police_clearance: 'Police Clearance Certificate'
            }).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label className="text-base font-medium">{label} *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(key as keyof typeof documents, file);
                    }}
                    className="flex-1"
                  />
                  {documents[key as keyof typeof documents] && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <Upload className="h-4 w-4" />
                      Uploaded
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Accepted formats: PDF, JPG, PNG (max 10MB)
                </p>
              </div>
            ))}
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start space-x-2 pt-4 border-t">
            <Checkbox
              id="consent"
              checked={backgroundCheckConsent}
              onCheckedChange={handleConsentChange}
            />
            <Label htmlFor="consent" className="text-sm leading-relaxed">
              I consent to background checks and verification of the information provided. 
              I understand that this is required to become a verified service provider.
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitVerification}
            disabled={!isFormValid() || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Verification'}
          </Button>

          {!isFormValid() && (
            <p className="text-sm text-gray-500 text-center">
              Please upload both required documents and accept the consent agreement to continue.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
