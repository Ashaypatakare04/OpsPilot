import { NextResponse } from 'next/server';
import { db } from '@/db/mockDatabase';
import { Invoice } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const invoice = db.getInvoice(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json({ invoice });
  }

  const invoices = db.getInvoices();
  return NextResponse.json({ invoices });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newInvoice: Invoice = {
      id: body.id || `inv-custom-${Date.now().toString().slice(-4)}`,
      invoiceNumber: body.invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorId: body.vendorId || 'vend-custom',
      vendorName: body.vendorName || 'Acme Cloud Services',
      vendorTaxId: body.vendorTaxId || 'GSTIN29AAACA1234B1Z5',
      vendorAddress: body.vendorAddress || 'Corporate Office, Level 2',
      invoiceDate: body.invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: body.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      currency: body.currency || 'INR',
      subtotal: Number(body.subtotal) || Number(body.totalAmount) * 0.82,
      taxAmount: Number(body.taxAmount) || Number(body.totalAmount) * 0.18,
      totalAmount: Number(body.totalAmount) || 50000,
      purchaseOrderNumber: body.purchaseOrderNumber || undefined,
      paymentDetails: body.paymentDetails || {
        accountName: body.vendorName || 'Vendor Payee Account',
        accountNumber: '918237461928',
        bankName: 'HDFC Bank',
        routingOrIfsc: 'HDFC0001824',
        paymentMethod: 'NEFT',
      },
      lineItems: body.lineItems || [
        {
          id: 'li-1',
          description: body.description || 'Cloud Infrastructure & API Compute Resources',
          quantity: 1,
          unitPrice: Number(body.totalAmount) || 50000,
          total: Number(body.totalAmount) || 50000,
        },
      ],
      confidenceScores: {
        vendor: 0.98,
        invoiceNumber: 0.99,
        totalAmount: 1.0,
        poNumber: body.purchaseOrderNumber ? 0.96 : 0.0,
        lineItems: 0.95,
        overall: 0.98,
      },
      fileType: body.fileType || 'demo',
      fileName: body.fileName || `${body.invoiceNumber || 'INV-Custom'}.pdf`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.saveInvoice(newInvoice);
    return NextResponse.json({ success: true, invoice: newInvoice });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
