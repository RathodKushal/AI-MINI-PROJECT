import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface InvoiceData {
  companyName: string;
  customerName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export const generateInvoice = (data: InvoiceData) => {
  const doc = new jsPDF();
  
  const dateStr = format(new Date(), 'MMM dd, yyyy');
  const invoiceId = `INV-${Date.now().toString().slice(-6)}`;
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text(data.companyName || 'My Company', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Invoice ID: ${invoiceId}`, 14, 30);
  doc.text(`Date: ${dateStr}`, 14, 35);
  
  // Bill To
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('Bill To:', 14, 50);
  doc.setFontSize(10);
  doc.text(data.customerName || 'Walk-in Customer', 14, 56);
  
  // Table
  autoTable(doc, {
    startY: 65,
    head: [['Item Description', 'Qty', 'Unit Price', 'Total']],
    body: [
      [
        data.productName,
        data.quantity.toString(),
        `$${data.unitPrice.toFixed(2)}`,
        `$${data.totalPrice.toFixed(2)}`
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [0, 136, 254] },
    margin: { top: 10 }
  });

  // Footer / Total
  const finalY = (doc as any).lastAutoTable.finalY || 80;
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`Grand Total: $${data.totalPrice.toFixed(2)}`, 140, finalY + 15);
  
  // Save
  doc.save(`${invoiceId}_${data.customerName.replace(/[^a-z0-9]/gi, '_')}.pdf`);
};
