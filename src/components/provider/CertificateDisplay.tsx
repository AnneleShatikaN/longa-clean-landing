
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Award, Share2 } from 'lucide-react';
import { ProviderCertificate } from '@/types/learning';
import { CustomCertificate } from './CustomCertificate';
import { toast } from 'sonner';

interface CertificateDisplayProps {
  certificate: ProviderCertificate;
  providerName: string;
  onBack: () => void;
}

export const CertificateDisplay: React.FC<CertificateDisplayProps> = ({
  certificate,
  onBack
}) => {
  const handleDownload = () => {
    const certificateElement = document.querySelector('.custom-certificate');
    if (certificateElement) {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Longa Academy Certificate</title>
              <style>
                body { margin: 0; padding: 0; }
                @media print {
                  body { background: white !important; }
                }
              </style>
            </head>
            <body>
              ${certificateElement.outerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Longa Academy Certificate',
          text: `I just completed the ${certificate.service_type} training at Longa Academy!`,
          url: window.location.href
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy URL to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Certificate link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Academy
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button 
            onClick={handleDownload}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Download/Print
          </Button>
        </div>
      </div>

      {/* Custom Certificate */}
      <CustomCertificate certificate={certificate} />

      {/* Next Steps Card */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Award className="h-6 w-6 text-green-600 mt-1" />
            <div>
              <h3 className="font-semibold text-green-800 mb-2">
                🎉 Congratulations on Your Achievement!
              </h3>
              <div className="text-green-700 space-y-2">
                <p>
                  You have successfully completed the Longa Academy training program. 
                  Your certificate proves your professional competency in {certificate.service_type} services.
                </p>
                <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">What's Next?</h4>
                  <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
                    <li>Complete your provider verification documents</li>
                    <li>Start accepting bookings on the Longa platform</li>
                    <li>Build your reputation with quality service</li>
                    <li>Keep your certificate handy for client confidence</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Details */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificate Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Certificate ID:</span>
              <span className="ml-2 font-mono text-blue-600">{certificate.certificate_id}</span>
            </div>
            <div>
              <span className="font-medium">Service Category:</span>
              <span className="ml-2 capitalize">{certificate.service_type}</span>
            </div>
            <div>
              <span className="font-medium">Issue Date:</span>
              <span className="ml-2">{new Date(certificate.issued_at).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <span className="ml-2 text-green-600">✓ Active & Verified</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
