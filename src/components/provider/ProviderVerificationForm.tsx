
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, DollarSign, Users, Shield } from 'lucide-react';

export const ProviderVerificationForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    routingNumber: '',
    accountType: 'checking',
    swiftCode: '',
    backgroundCheckConsent: false,
    references: [
      { name: '', phone: '', email: '', relationship: '', company: '', yearsKnown: '' },
      { name: '', phone: '', email: '', relationship: '', company: '', yearsKnown: '' }
    ],
    documents: {
      nationalId: null as File | null,
      proofOfResidence: null as File | null,
      skillsCertificate: null as File | null,
      bankStatement: null as File | null
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleReferenceChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => 
        i === index ? { ...ref, [field]: value } : ref
      )
    }));
  };

  const handleFileChange = (documentType: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [documentType]: file }
    }));
  };

  const uploadDocument = async (file: File, documentType: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user!.id}/${documentType}_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('verification-documents')
      .upload(fileName, file);

    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Upload documents
      const documentPromises = Object.entries(formData.documents)
        .filter(([_, file]) => file)
        .map(async ([type, file]) => {
          const filePath = await uploadDocument(file!, type);
          return {
            provider_id: user.id,
            document_type: type,
            document_name: file!.name,
            file_path: filePath,
            file_size: file!.size,
            mime_type: file!.type
          };
        });

      const uploadedDocs = await Promise.all(documentPromises);

      // Insert documents
      if (uploadedDocs.length > 0) {
        const { error: docsError } = await supabase
          .from('provider_documents')
          .insert(uploadedDocs);
        
        if (docsError) throw docsError;
      }

      // Insert banking details
      const { error: bankingError } = await supabase
        .from('provider_banking_details')
        .insert({
          provider_id: user.id,
          bank_name: formData.bankName,
          account_number: formData.accountNumber,
          account_holder_name: formData.accountHolderName,
          routing_number: formData.routingNumber,
          account_type: formData.accountType,
          swift_code: formData.swiftCode
        });

      if (bankingError) throw bankingError;

      // Insert references
      const references = formData.references
        .filter(ref => ref.name && ref.phone)
        .map(ref => ({
          provider_id: user.id,
          reference_name: ref.name,
          reference_phone: ref.phone,
          reference_email: ref.email,
          relationship: ref.relationship,
          company_name: ref.company,
          years_known: ref.yearsKnown ? parseInt(ref.yearsKnown) : null
        }));

      if (references.length > 0) {
        const { error: refsError } = await supabase
          .from('provider_references')
          .insert(references);
        
        if (refsError) throw refsError;
      }

      // Update user verification status
      const { error: userError } = await supabase
        .from('users')
        .update({
          verification_status: 'under_review',
          verification_submitted_at: new Date().toISOString(),
          background_check_consent: formData.backgroundCheckConsent
        })
        .eq('id', user.id);

      if (userError) throw userError;

      toast({
        title: "Verification Submitted",
        description: "Your verification has been submitted and is under review.",
      });

    } catch (error) {
      console.error('Error submitting verification:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Document Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries({
            nationalId: 'National ID / Passport',
            proofOfResidence: 'Proof of Residence',
            skillsCertificate: 'Skills Certificate (Optional)',
            bankStatement: 'Bank Statement'
          }).map(([key, label]) => (
            <div key={key}>
              <Label>{label}</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)}
                className="mt-1"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Banking Details Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Banking Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Bank Name</Label>
              <Input
                value={formData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Account Number</Label>
              <Input
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Account Holder Name</Label>
              <Input
                value={formData.accountHolderName}
                onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Routing Number</Label>
              <Input
                value={formData.routingNumber}
                onChange={(e) => handleInputChange('routingNumber', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* References Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Professional References (Minimum 2)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.references.map((ref, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-3">
              <h4 className="font-medium">Reference {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={ref.name}
                    onChange={(e) => handleReferenceChange(index, 'name', e.target.value)}
                    required={index < 2}
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={ref.phone}
                    onChange={(e) => handleReferenceChange(index, 'phone', e.target.value)}
                    required={index < 2}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={ref.email}
                    onChange={(e) => handleReferenceChange(index, 'email', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Relationship</Label>
                  <Input
                    value={ref.relationship}
                    onChange={(e) => handleReferenceChange(index, 'relationship', e.target.value)}
                    placeholder="e.g., Former employer, Client"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Consent Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Background Check Consent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="background-consent"
              checked={formData.backgroundCheckConsent}
              onCheckedChange={(checked) => handleInputChange('backgroundCheckConsent', checked)}
              required
            />
            <Label htmlFor="background-consent" className="text-sm leading-5">
              I consent to a background check being performed as part of the verification process. 
              This may include verification of identity, employment history, and criminal background check.
            </Label>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
      </Button>
    </form>
  );
};

export default ProviderVerificationForm;
