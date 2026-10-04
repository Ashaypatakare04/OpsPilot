import { Currency } from '@/types';

export interface PaymentExecutionParams {
  invoiceId: string;
  invoiceNumber: string;
  vendorName: string;
  amount: number;
  currency: Currency;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    routingOrIfsc: string;
  };
}

export interface PaymentExecutionResult {
  success: boolean;
  paymentReference: string;
  adapterUsed: string;
  executedAt: string;
  amount: number;
  currency: Currency;
  isSimulated: boolean;
  verificationStatus: 'VERIFIED' | 'FAILED';
  verificationProof: string;
  settlementDetails: {
    clearingNetwork: string;
    beneficiaryAccountMasked: string;
    ledgerConfirmationCode: string;
  };
}

export class DemoPaymentAdapter {
  private adapterName = 'DemoPaymentAdapter (Simulated NEFT/RTGS Rails)';

  public async executePayment(params: PaymentExecutionParams): Promise<PaymentExecutionResult> {
    // Simulate real network flight time
    await new Promise((resolve) => setTimeout(resolve, 350));

    const timestamp = new Date().toISOString();
    const randomHex = Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
    const txnRef = `DEMO-PAY-${Date.now().toString().slice(-6)}-${randomHex}`;
    const maskedAcct = `••••${params.bankDetails.accountNumber.slice(-4)}`;

    return {
      success: true,
      paymentReference: txnRef,
      adapterUsed: this.adapterName,
      executedAt: timestamp,
      amount: params.amount,
      currency: params.currency,
      isSimulated: true, // DEMO ENVIRONMENT GUARANTEE
      verificationStatus: 'VERIFIED',
      verificationProof: `SIM-ACK-${params.bankDetails.bankName.replace(/\s+/g, '')}-${params.bankDetails.accountNumber.slice(-4)}-OK`,
      settlementDetails: {
        clearingNetwork: params.amount > 200000 ? 'RBI RTGS Demo Network' : 'RBI NEFT Demo Rail',
        beneficiaryAccountMasked: maskedAcct,
        ledgerConfirmationCode: `GL-RECON-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      },
    };
  }

  public async verifySettlement(paymentReference: string): Promise<{ verified: boolean; proof: string }> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return {
      verified: true,
      proof: `AUDIT-PROOF-HASH-${paymentReference}-${Date.now()}`,
    };
  }
}

export const paymentAdapter = new DemoPaymentAdapter();
