
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, FileText, Check, AlertCircle, User, CreditCard, Users } from 'lucide-react';

interface DocumentUpload {
  id: string;
  type: string;
  name: string;
  required: boolean;
  uploaded: boolean;
  file?: File;
}

const REQUIRED_DOCUMENTS: DocumentUpload[] = [
  { id: 'id_document', type: 'identification', name: 'National ID or Passport', required: true, uploaded: false },
  { id: 'proof_of_residence', type: 'address', name: 'Proof of Residence', required: true, uploaded: false },
  { id: 'skills_certificate', type: 'qualification', name: 'Skills Certificate or Qualification', required: false, uploaded: false },
  { id: 'bank_statement', type: 'banking', name: 'Bank Statement (Last 3 months)', required: true, uploaded: false }
];

export const ProviderVerificationForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<DocumentUpload[]>(REQUIRED_DOCUMENTS);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Banking details
  const [bankingDetails, setBankingDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: user?.full_name || '',
    routingNumber: '',
    accountType: 'checking',
    swiftCode: ''
  });

  // Professional references
  const [references, setReferences] = useState([
    { referenceName: '', referencePhone: '', referenceEmail: '', relationship: '', companyName: '', yearsKnown: '' },
    { referenceName: '', referencePhone: '', referenceEmail: '', relationship: '', companyName: '', yearsKnown: '' }
  ]);

  const [backgroundCheckConsent, setBackgroundCheckConsent] = useState(false);

  const handleFileUpload = async (documentId: string, file: File) => {
    if (!user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${documentId}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Update document state
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, uploaded: true, file }
            : doc
        )
      );

      // Save document record to database
      const { error: dbError } = await supabase
        .from('provider_documents')
        .insert({
          provider_id: user.id,
          document_type: documents.find(d => d.id === documentId)?.type || 'other',
          document_name: file.name,
          file_path: fileName,
          file_size: file.size,
          mime_type: file.type
        });

      if (dbError) throw dbError;

      toast({
        title: "Document uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBankingDetailsSubmit = async () => {
    try {
      const { error } = await supabase
        .from('provider_banking_details')
        .insert({
          provider_id: user?.id,
          ...bankingDetails
        });

      if (error) throw error;

      toast({
        title: "Banking details saved",
        description: "Your banking information has been saved securely.",
      });
      setCurrentStep(3);
    } catch (error) {
      console.error('Banking details error:', error);
      toast({
        title: "Save failed",
        description: "Failed to save banking details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReferencesSubmit = async () => {
    try {
      const validReferences = references.filter(ref => ref.referenceName && ref.referencePhone);
      
      if (validReferences.length < 2) {
        toast({
          title: "References required",
          description: "Please provide at least 2 professional references.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('provider_references')
        .insert(
          validReferences.map(ref => ({
            provider_id: user?.id,
            reference_name: ref.referenceName,
            reference_phone: ref.referencePhone,
            reference_email: ref.referenceEmail,
            relationship: ref.relationship,
            company_name: ref.companyName,
            years_known: parseInt(ref.yearsKnown) || 0
          }))
        );

      if (error) throw error;

      toast({
        title: "References saved",
        description: "Your professional references have been saved.",
      });
      setCurrentStep(4);
    } catch (error) {
      console.error('References error:', error);
      toast({
        title: "Save failed",
        description: "Failed to save references. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFinalSubmit = async () => {
    if (!backgroundCheckConsent) {
      toast({
        title: "Consent required",
        description: "Please consent to background check to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Update user verification status
      const { error } = await supabase
        .from('users')
        .update({
          verification_status: 'under_review',
          verification_submitted_at: new Date().toISOString(),
          background_check_consent: backgroundCheckConsent
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Verification submitted",
        description: "Your verification has been submitted for review. You'll be notified of the status.",
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission failed",
        description: "Failed to submit verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepProgress = () => (currentStep / 4) * 100;
  const requiredDocsUploaded = documents.filter(d => d.required && d.uploaded).length;
  const totalRequiredDocs = documents.filter(d => d.required).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Provider Verification Process
          </CardTitle>
          <div className="space-y-2">
            <Progress value={getStepProgress()} className="w-full" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {currentStep} of 4</span>
              <span>{Math.round(getStepProgress())}% Complete</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Step 1: Document Upload */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Upload
            </CardTitle>
            <p className="text-gray-600">Upload required verification documents</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{doc.name}</span>
                    {doc.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                    {doc.uploaded && <Check className="h-4 w-4 text-green-600" />}
                  </div>
                </div>
                
                {!doc.uploaded ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(doc.id, file);
                      }}
                      className="flex-1"
                    />
                    <Upload className="h-4 w-4 text-gray-400" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-sm">Uploaded: {doc.file?.name}</span>
                  </div>
                )}
              </div>
            ))}
            
            <div className="pt-4">
              <Button 
                onClick={() => setCurrentStep(2)} 
                disabled={requiredDocsUploaded < totalRequiredDocs}
                className="w-full"
              >
                Continue to Banking Details
                {requiredDocsUploaded < totalRequiredDocs && (
                  <span className="ml-2">({requiredDocsUploaded}/{totalRequiredDocs} required docs uploaded)</span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Banking Details */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Banking Details
            </CardTitle>
            <p className="text-gray-600">Provide your banking information for payments</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  value={bankingDetails.bankName}
                  onChange={(e) => setBankingDetails(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="e.g., Bank Windhoek"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  value={bankingDetails.accountNumber}
                  onChange={(e) => setBankingDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="Account number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                <Input
                  id="accountHolderName"
                  value={bankingDetails.accountHolderName}
                  onChange={(e) => setBankingDetails(prev => ({ ...prev, accountHolderName: e.target.value }))}
                  placeholder="Full name as on account"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="routingNumber">Branch Code</Label>
                <Input
                  id="routingNumber"
                  value={bankingDetails.routingNumber}
                  onChange={(e) => setBankingDetails(prev => ({ ...prev, routingNumber: e.target.value }))}
                  placeholder="Branch code"
                />
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button 
                onClick={handleBankingDetailsSubmit}
                disabled={!bankingDetails.bankName || !bankingDetails.accountNumber || !bankingDetails.accountHolderName}
                className="flex-1"
              >
                Continue to References
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Professional References */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Professional References
            </CardTitle>
            <p className="text-gray-600">Provide at least 2 professional references</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {references.map((ref, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">Reference {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={ref.referenceName}
                      onChange={(e) => {
                        const newRefs = [...references];
                        newRefs[index].referenceName = e.target.value;
                        setReferences(newRefs);
                      }}
                      placeholder="Reference full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input
                      value={ref.referencePhone}
                      onChange={(e) => {
                        const newRefs = [...references];
                        newRefs[index].referencePhone = e.target.value;
                        setReferences(newRefs);
                      }}
                      placeholder="+264 XX XXX XXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={ref.referenceEmail}
                      onChange={(e) => {
                        const newRefs = [...references];
                        newRefs[index].referenceEmail = e.target.value;
                        setReferences(newRefs);
                      }}
                      placeholder="reference@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship *</Label>
                    <Input
                      value={ref.relationship}
                      onChange={(e) => {
                        const newRefs = [...references];
                        newRefs[index].relationship = e.target.value;
                        setReferences(newRefs);
                      }}
                      placeholder="e.g., Former employer, Client"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input
                      value={ref.companyName}
                      onChange={(e) => {
                        const newRefs = [...references];
                        newRefs[index].companyName = e.target.value;
                        setReferences(newRefs);
                      }}
                      placeholder="Company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Years Known</Label>
                    <Input
                      type="number"
                      value={ref.yearsKnown}
                      onChange={(e) => {
                        const newRefs = [...references];
                        newRefs[index].yearsKnown = e.target.value;
                        setReferences(newRefs);
                      }}
                      placeholder="Years"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button onClick={handleReferencesSubmit} className="flex-1">
                Continue to Final Step
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Final Consent */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Background Check Consent
            </CardTitle>
            <p className="text-gray-600">Final step to complete your verification</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">What happens next?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Your documents will be reviewed by our verification team</li>
                <li>• We may contact your references for verification</li>
                <li>• A background check will be conducted if consented</li>
                <li>• You'll receive email updates on your verification status</li>
                <li>• Once verified, you can start accepting bookings</li>
              </ul>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="background-consent"
                checked={backgroundCheckConsent}
                onCheckedChange={(checked) => setBackgroundCheckConsent(checked as boolean)}
              />
              <div className="text-sm">
                <Label htmlFor="background-consent" className="font-medium">
                  I consent to a background check being conducted *
                </Label>
                <p className="text-gray-600 mt-1">
                  This helps ensure the safety and trust of our platform for all users. 
                  The background check will include criminal history and identity verification.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                Back
              </Button>
              <Button 
                onClick={handleFinalSubmit} 
                disabled={!backgroundCheckConsent || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
