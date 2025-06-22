
import React from 'react';
import { ProviderCertificate } from '@/types/learning';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface CustomCertificateProps {
  certificate: ProviderCertificate;
  className?: string;
}

export const CustomCertificate: React.FC<CustomCertificateProps> = ({
  certificate,
  className = ''
}) => {
  const { user } = useAuth();

  const getServiceDetails = (serviceType: string) => {
    switch (serviceType) {
      case 'cleaning':
        return {
          academyName: 'Longa Cleaning Academy',
          profession: 'verified Cleaning Professional',
          certificatePrefix: 'LONGA-CLEANING',
          topics: [
            'Cleaning Essentials',
            'Room-by-Room Cleaning',
            'Safety & Hygiene',
            'Client Etiquette',
            'Professional Service',
            'Quality Assurance'
          ]
        };
      case 'gardening':
        return {
          academyName: 'Longa Gardening Academy',
          profession: 'verified Gardening Professional',
          certificatePrefix: 'LONGA-GARDENING',
          topics: [
            'Plant Care Basics',
            'Garden Maintenance',
            'Tool Safety',
            'Landscaping Techniques',
            'Professional Service',
            'Quality Standards'
          ]
        };
      default:
        return {
          academyName: 'Longa Car Wash Academy',
          profession: 'verified Car Wash Professional',
          certificatePrefix: 'LONGA-CARWASH',
          topics: [
            'Equipment & Setup',
            'Exterior Cleaning',
            'Interior Cleaning',
            'Safety & Hygiene',
            'Professional Service',
            'Quality Control'
          ]
        };
    }
  };

  const serviceDetails = getServiceDetails(certificate.service_type);
  const completionDate = format(new Date(certificate.issued_at), 'MMMM dd, yyyy');

  return (
    <div className={`custom-certificate ${className}`}>
      <style>{`
        .custom-certificate * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .custom-certificate {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .certificate {
          background: white;
          width: 800px;
          max-width: 100%;
          padding: 50px;
          border-radius: 15px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          border: 8px solid #2c5aa0;
          position: relative;
          overflow: hidden;
        }

        .certificate::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #2c5aa0, #4CAF50, #FF9800, #2c5aa0);
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
        }

        .logo-space {
          width: 80px;
          height: 80px;
          border: 2px dashed #ccc;
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          font-size: 12px;
          background: #f9f9f9;
        }

        .platform-name {
          font-size: 36px;
          font-weight: 700;
          color: #2c5aa0;
          margin-bottom: 8px;
          letter-spacing: 2px;
        }

        .platform-tagline {
          font-size: 14px;
          color: #666;
          font-style: italic;
        }

        .certificate-title {
          font-size: 28px;
          color: #333;
          margin-bottom: 15px;
          font-weight: 600;
        }

        .academy-name {
          font-size: 20px;
          color: #4CAF50;
          margin-bottom: 30px;
          font-weight: 500;
        }

        .main-content {
          text-align: center;
          margin-bottom: 35px;
          line-height: 1.6;
        }

        .certificate-text {
          font-size: 16px;
          color: #555;
          margin-bottom: 25px;
        }

        .recipient-name {
          font-size: 32px;
          font-weight: 700;
          color: #2c5aa0;
          margin: 25px 0;
          padding: 15px 30px;
          border-bottom: 3px solid #4CAF50;
          display: inline-block;
          min-width: 300px;
        }

        .completion-text {
          font-size: 16px;
          color: #555;
          margin-bottom: 30px;
        }

        .course-topics {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 25px;
          margin: 30px 0;
          border-left: 5px solid #4CAF50;
        }

        .topics-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 15px;
        }

        .topics-list {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px;
        }

        .topic-item {
          background: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          color: #555;
          border: 1px solid #e0e0e0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .footer-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .date-section, .signature-section, .certificate-id {
          text-align: center;
        }

        .date-value, .signature-line {
          border-bottom: 2px solid #333;
          padding: 10px 20px;
          margin-bottom: 8px;
          min-width: 150px;
          display: inline-block;
        }

        .signature-line {
          min-width: 200px;
        }

        .label {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }

        .certificate-id-value {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #888;
          background: #f5f5f5;
          padding: 5px 10px;
          border-radius: 4px;
          display: inline-block;
        }

        .platform-footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          font-size: 12px;
          color: #888;
        }

        .achievement-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          background: linear-gradient(45deg, #4CAF50, #45a049);
          color: white;
          padding: 8px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          transform: rotate(15deg);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        @media (max-width: 600px) {
          .certificate {
            padding: 30px 20px;
            margin: 10px;
          }
          
          .platform-name {
            font-size: 28px;
          }
          
          .certificate-title {
            font-size: 24px;
          }
          
          .recipient-name {
            font-size: 24px;
            min-width: 250px;
          }
          
          .footer-section {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          
          .topics-list {
            flex-direction: column;
            align-items: center;
          }
        }

        @media print {
          .custom-certificate {
            background: white;
            padding: 0;
          }
          
          .certificate {
            box-shadow: none;
            border: 2px solid #2c5aa0;
            margin: 0;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="certificate">
        <div className="achievement-badge">VERIFIED</div>
        
        <div className="header">
          <div className="logo-space">LOGO</div>
          <div className="platform-name">LONGA</div>
          <div className="platform-tagline">Namibia's Smart Services Platform</div>
        </div>

        <div className="main-content">
          <h1 className="certificate-title">Certificate of Completion</h1>
          <h2 className="academy-name">{serviceDetails.academyName}</h2>
          
          <div className="certificate-text">
            This certificate is proudly awarded to
          </div>
          
          <div className="recipient-name">{user?.full_name || 'Provider Name'}</div>
          
          <div className="completion-text">
            for successfully completing the {serviceDetails.academyName} training course and 
            demonstrating readiness to serve as a <strong>{serviceDetails.profession}</strong> 
            on the Longa platform.
          </div>

          <div className="course-topics">
            <div className="topics-title">Training Completed:</div>
            <div className="topics-list">
              {serviceDetails.topics.map((topic, index) => (
                <div key={index} className="topic-item">{topic}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-section">
          <div className="date-section">
            <div className="date-value">{completionDate}</div>
            <div className="label">Date of Completion</div>
          </div>
          
          <div className="certificate-id">
            <div className="certificate-id-value">{certificate.certificate_id}</div>
            <div className="label">Certificate ID</div>
          </div>
          
          <div className="signature-section">
            <div className="signature-line">Longa Admin Signature</div>
            <div className="label">Longa Academy Director</div>
          </div>
        </div>

        <div className="platform-footer">
          Empowering Local Excellence • www.longa.na
        </div>
      </div>
    </div>
  );
};
