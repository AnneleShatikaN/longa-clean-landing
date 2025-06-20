
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface VerificationFormProps {
  onSuccess?: () => void;
}

const ProviderVerificationForm: React.FC<VerificationFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const { user, updateProfile } = useAuth();
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
    { key: 'police_clearance', label: 'Police Clearance Certificate', required: true },
    { key: 'proof_of_address', label: 'Proof of Address', required: false },
    { key: 'qualifications', label: 'Qualifications/Certificates', required: false }
  ];

  const handleFileUpload = (documentType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a JPEG, PNG, PDF, or WebP file",
          variant: "destructive",
        });
        return;
      }

      setUploadedFiles(prev => ({
        ...prev,
        [documentType]: file
      }));
    }
  };

  const uploadDocumentToStorage = async (file: File, documentType: string, providerId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${providerId}/${documentType}_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('verification-documents')
      .upload(fileName, file, {
        upsert: false
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
      await updateProfile({
        full_name: formData.fullName,
        phone: formData.phoneNumber,
        verification_status: 'pending',
        verification_submitted_at: new Date().toISOString(),
        background_check_consent: formData.backgroundCheckConsent
      });

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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="idNumber">ID/Passport Number</Label>
              <Input
                id="idNumber"
                value={formData.idNumber}
                onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="experience">Years of Experience</Label>
              <Textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                placeholder="Describe your relevant work experience..."
              />
            </div>
          </div>

          {/* Document Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Document Upload</h3>
            
            {requiredDocuments.map((doc) => (
              <div key={doc.key} className="space-y-2">
                <Label htmlFor={doc.key} className="flex items-center gap-2">
                  {doc.label}
                  {doc.required && <span className="text-red-500">*</span>}
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id={doc.key}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.webp"
                    onChange={(e) => handleFileUpload(doc.key, e)}
                    className="flex-1"
                  />
                  {uploadedFiles[doc.key] && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">{uploadedFiles[doc.key].name}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Banking Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Banking Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input
                  id="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData({...formData, accountHolderName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="branchCode">Branch Code</Label>
                <Input
                  id="branchCode"
                  value={formData.branchCode}
                  onChange={(e) => setFormData({...formData, branchCode: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Consent and Terms */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="backgroundCheck"
                checked={formData.backgroundCheckConsent}
                onCheckedChange={(checked) => 
                  setFormData({...formData, backgroundCheckConsent: checked as boolean})
                }
              />
              <Label htmlFor="backgroundCheck" className="text-sm">
                I consent to a background check being performed
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.termsAccepted}
                onCheckedChange={(checked) => 
                  setFormData({...formData, termsAccepted: checked as boolean})
                }
              />
              <Label htmlFor="terms" className="text-sm">
                I accept the terms and conditions
              </Label>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </div>
            ) : (
              "Submit Verification"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProviderVerificationForm;
