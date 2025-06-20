
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface VerificationFormProps {
  onSuccess?: () => void;
}

const ProviderVerificationForm: React.FC<VerificationFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: File}>({});
  
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    phoneNumber: user?.phone || '',
    idNumber: '',
    experience: '',
    backgroundCheckConsent: false,
    termsAccepted: false,
    // Banking details
    bankName: '',
    accountNumber: '',
    accountHolderName: user?.full_name || '',
    branchCode: ''
  });

  const requiredDocuments = [
    { key: 'id_document', label: 'National ID or Passport', required: true },
    { key: 'proof_of_address', label: 'Proof of Address', required: true },
    { key: 'qualifications', label: 'Qualifications/Certificates', required: false },
    { key: 'criminal_record', label: 'Criminal Record Check', required: false }
  ];

  const handleFileUpload = (documentType: string, file: File) => {
    setUploadedFiles(prev => ({
      ...prev,
      [documentType]: file
    }));
  };

  const uploadDocumentToStorage = async (file: File, documentType: string, providerId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${providerId}/${documentType}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('provider-documents')
      .upload(fileName, file, {
        upsert: true
      });

    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to submit verification.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.termsAccepted || !formData.backgroundCheckConsent) {
      toast({
        title: "Validation Error",
        description: "Please accept the terms and conditions and provide background check consent.",
        variant: "destructive",
      });
      return;
    }

    // Check required documents
    const requiredDocs = requiredDocuments.filter(doc => doc.required);
    const missingDocs = requiredDocs.filter(doc => !uploadedFiles[doc.key]);
    
    if (missingDocs.length > 0) {
      toast({
        title: "Missing Documents",
        description: `Please upload the following required documents: ${missingDocs.map(d => d.label).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Submitting provider verification for user:', user.id);

      // Upload documents to storage
      const documentPaths: {[key: string]: string} = {};
      for (const [docType, file] of Object.entries(uploadedFiles)) {
        console.log(`Uploading ${docType} document...`);
        const path = await uploadDocumentToStorage(file, docType, user.id);
        documentPaths[docType] = path;
      }

      // Update user verification status and details
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          full_name: formData.fullName,
          phone: formData.phoneNumber,
          verification_status: 'pending',
          verification_submitted_at: new Date().toISOString(),
          verification_documents: documentPaths,
          background_check_consent: formData.backgroundCheckConsent
        })
        .eq('id', user.id);

      if (userUpdateError) throw userUpdateError;

      // Save banking details
      const { error: bankingError } = await supabase
        .from('provider_banking_details')
        .upsert({
          provider_id: user.id,
          bank_name: formData.bankName,
          account_number: formData.accountNumber,
          account_holder_name: formData.accountHolderName,
          branch_code: formData.branchCode,
          verification_status: 'pending'
        });

      if (bankingError) throw bankingError;

      // Create document records
      for (const [docType, path] of Object.entries(documentPaths)) {
        const { error: docError } = await supabase
          .from('provider_documents')
          .insert({
            provider_id: user.id,
            document_type: docType,
            document_name: uploadedFiles[docType].name,
            file_path: path,
            mime_type: uploadedFiles[docType].type,
            file_size: uploadedFiles[docType].size,
            verification_status: 'pending'
          });

        if (docError) {
          console.error(`Error saving ${docType} document record:`, docError);
        }
      }

      console.log('Provider verification submitted successfully');

      toast({
        title: "Verification Submitted!",
        description: "Your verification documents have been submitted for review. You'll receive an update within 2-3 business days.",
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Provider Verification Application</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="idNumber">ID Number *</Label>
              <Input
                id="idNumber"
                value={formData.idNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                placeholder="Enter your national ID number"
                required
              />
            </div>

            <div>
              <Label htmlFor="experience">Relevant Experience</Label>
              <Textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                placeholder="Describe your relevant work experience..."
                rows={4}
              />
            </div>
          </div>

          {/* Banking Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Banking Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="e.g., First National Bank"
                  required
                />
              </div>
              <div>
                <Label htmlFor="branchCode">Branch Code</Label>
                <Input
                  id="branchCode"
                  value={formData.branchCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, branchCode: e.target.value }))}
                  placeholder="e.g., 280172"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                <Input
                  id="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountHolderName: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Required Documents</h3>
            
            {requiredDocuments.map((doc) => (
              <div key={doc.key} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">
                    {doc.label} {doc.required && '*'}
                  </Label>
                  {uploadedFiles[doc.key] && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(doc.key, file);
                    }}
                    className="flex-1"
                  />
                  <Upload className="h-4 w-4 text-gray-400" />
                </div>
                
                {uploadedFiles[doc.key] && (
                  <p className="text-sm text-green-600 mt-1">
                    <FileText className="h-4 w-4 inline mr-1" />
                    {uploadedFiles[doc.key].name}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Consent and Terms */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="backgroundCheck"
                checked={formData.backgroundCheckConsent}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, backgroundCheckConsent: !!checked }))
                }
              />
              <Label htmlFor="backgroundCheck" className="text-sm">
                I consent to a background check being performed as part of the verification process *
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.termsAccepted}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, termsAccepted: !!checked }))
                }
              />
              <Label htmlFor="terms" className="text-sm">
                I accept the terms and conditions and privacy policy *
              </Label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="submit" disabled={isSubmitting} className="px-8">
              {isSubmitting ? 'Submitting...' : 'Submit Verification'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProviderVerificationForm;
