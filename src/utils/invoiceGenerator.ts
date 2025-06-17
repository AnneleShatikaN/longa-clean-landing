
import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface InvoiceData {
  transaction: {
    id: string;
    amount: number;
    transaction_type: string;
    status: string;
    created_at: string;
    reference_number?: string;
    admin_notes?: string;
  };
  user: {
    full_name?: string;
    email?: string;
    phone?: string;
  };
  invoiceNumber: string;
}

export const generateInvoicePDF = ({ transaction, user, invoiceNumber }: InvoiceData) => {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(44, 82, 130); // Blue color
  doc.text('LONGA SERVICES', 20, 30);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Professional Home Services', 20, 40);
  doc.text('Windhoek, Namibia', 20, 48);
  
  // Invoice title and number
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', 150, 30);
  
  doc.setFontSize(10);
  doc.text(`Invoice #: ${invoiceNumber}`, 150, 40);
  doc.text(`Date: ${format(new Date(transaction.created_at), 'MMM dd, yyyy')}`, 150, 48);
  
  // Payment status
  const statusColor = transaction.status === 'approved' ? [34, 197, 94] : 
                     transaction.status === 'declined' ? [239, 68, 68] : [156, 163, 175];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setFontSize(12);
  const statusText = transaction.status === 'approved' ? 'PAID' : 
                    transaction.status === 'declined' ? 'DECLINED' : 'UNPAID';
  doc.text(statusText, 150, 58);
  
  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 70, 190, 70);
  
  // Bill to section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text('BILL TO:', 20, 85);
  
  doc.setFontSize(10);
  doc.text(user.full_name || 'N/A', 20, 95);
  if (user.email) doc.text(user.email, 20, 103);
  if (user.phone) doc.text(user.phone, 20, 111);
  
  // Payment details section
  doc.setFontSize(12);
  doc.text('PAYMENT DETAILS:', 20, 130);
  
  doc.setFontSize(10);
  doc.text('Payment Method: Bank Deposit', 20, 140);
  if (transaction.reference_number) {
    doc.text(`Reference Number: ${transaction.reference_number}`, 20, 148);
  }
  
  // Service details table
  doc.setFontSize(12);
  doc.text('SERVICE DETAILS:', 20, 165);
  
  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 175, 170, 15, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Description', 25, 185);
  doc.text('Type', 100, 185);
  doc.text('Amount', 150, 185);
  
  // Table content
  const serviceType = transaction.transaction_type === 'subscription' ? 'Package Subscription' : 'Service Booking';
  doc.text('Professional Service', 25, 200);
  doc.text(serviceType, 100, 200);
  doc.text(`N$${transaction.amount.toFixed(2)}`, 150, 200);
  
  // Total section
  doc.setDrawColor(200, 200, 200);
  doc.line(120, 210, 190, 210);
  
  doc.setFontSize(12);
  doc.text('TOTAL:', 120, 225);
  doc.setFontSize(14);
  doc.text(`N$${transaction.amount.toFixed(2)}`, 150, 225);
  
  // Payment status note
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  if (transaction.status === 'approved') {
    doc.text('Payment has been verified and approved.', 20, 245);
  } else if (transaction.status === 'declined') {
    doc.text('Payment was declined. Please contact support.', 20, 245);
    if (transaction.admin_notes) {
      doc.text(`Note: ${transaction.admin_notes}`, 20, 253);
    }
  } else {
    doc.text('Payment is pending verification.', 20, 245);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('This is a computer-generated invoice.', 20, 270);
  doc.text('For questions, please contact: support@longaservices.com', 20, 278);
  
  // Save the PDF
  const fileName = `Invoice_${invoiceNumber}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(fileName);
};
