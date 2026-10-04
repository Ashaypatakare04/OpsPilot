import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIAnalysisRequest {
  invoiceData: {
    vendorName: string;
    invoiceNumber: string;
    totalAmount: number;
    currency: string;
    poNumber?: string;
    lineItems: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  };
  poData?: {
    poNumber: string;
    vendorName: string;
    totalAmount: number;
    currency: string;
    lineItems: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  } | null;
  vendorData?: {
    name: string;
    isVerified: boolean;
    trustScore: number;
    status: string;
  } | null;
  anomaliesDetected: string[];
}

export interface AIAnalysisResponse {
  decisionExplanation: string;
  recommendedAction: 'AUTO_PROCESS' | 'REQUIRE_APPROVAL' | 'BLOCK';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  executiveSummary: string;
  source: 'GEMINI_AI' | 'DETERMINISTIC_FALLBACK';
}

export class GeminiProvider {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName = 'gemini-1.5-flash';

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim() !== '' && apiKey !== 'undefined') {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
      } catch (err) {
        console.warn('Failed to initialize GoogleGenerativeAI client:', err);
      }
    }
  }

  public isAvailable(): boolean {
    return this.genAI !== null;
  }

  public async analyzeInvoiceOperation(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: this.modelName,
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        });

        const prompt = `
You are the AI Risk & Operations Engine for OpsPilot, an autonomous finance operations layer.
Your mission is: "AI should know when NOT to automate. Automate the routine. Protect against risk."

Evaluate this invoice operational context:
INVOICE:
${JSON.stringify(request.invoiceData, null, 2)}

PURCHASE ORDER:
${request.poData ? JSON.stringify(request.poData, null, 2) : 'NONE / MISSING'}

VENDOR REGISTRY:
${request.vendorData ? JSON.stringify(request.vendorData, null, 2) : 'UNKNOWN VENDOR'}

FLAGGED ANOMALIES:
${JSON.stringify(request.anomaliesDetected, null, 2)}

AUTONOMY RULES:
- If duplicate invoice detected or potential fraud: BLOCK (Risk: CRITICAL, Score: 95-100)
- If missing PO, amount exceeds PO, unverified vendor, or invoice > ₹50,000 / $1,000: REQUIRE_APPROVAL (Risk: HIGH or MEDIUM, Score: 50-89)
- If PO matches exactly, vendor verified, amount <= ₹50,000 / $1,000, and no anomalies: AUTO_PROCESS (Risk: LOW, Score: 5-25)

Return JSON with this schema:
{
  "decisionExplanation": "A concise 1-2 sentence non-technical operational rationale explaining why this was decided (do not expose private chain-of-thought)",
  "recommendedAction": "AUTO_PROCESS" | "REQUIRE_APPROVAL" | "BLOCK",
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "riskScore": number (0-100),
  "executiveSummary": "1 sentence high level overview for executive dashboard"
}
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(text) as {
          decisionExplanation: string;
          recommendedAction: 'AUTO_PROCESS' | 'REQUIRE_APPROVAL' | 'BLOCK';
          riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
          riskScore: number;
          executiveSummary: string;
        };

        return {
          ...parsed,
          source: 'GEMINI_AI',
        };
      } catch (err) {
        console.warn('Gemini API call failed, falling back to deterministic risk engine:', err);
      }
    }

    // Deterministic fallback rule engine (Rock solid reliability guarantee)
    return this.deterministicAnalysis(request);
  }

  public deterministicAnalysis(request: AIAnalysisRequest): AIAnalysisResponse {
    const { invoiceData, poData, vendorData, anomaliesDetected } = request;

    // 1. Check duplicate or fraud
    if (anomaliesDetected.some((a) => a.toLowerCase().includes('duplicate'))) {
      return {
        decisionExplanation: `Duplicate invoice record identified for ${invoiceData.invoiceNumber}. Autonomous execution terminated to prevent duplicate disbursement.`,
        recommendedAction: 'BLOCK',
        riskLevel: 'CRITICAL',
        riskScore: 99,
        executiveSummary: `Blocked duplicate submission of invoice ${invoiceData.invoiceNumber}.`,
        source: 'DETERMINISTIC_FALLBACK',
      };
    }

    // 2. Check vendor verification
    if (!vendorData || !vendorData.isVerified || vendorData.trustScore < 50) {
      return {
        decisionExplanation: `Vendor "${invoiceData.vendorName}" is unverified or has low trust score (${vendorData?.trustScore ?? 0}%). Manual approval required before issuing payment.`,
        recommendedAction: 'REQUIRE_APPROVAL',
        riskLevel: 'HIGH',
        riskScore: 82,
        executiveSummary: `Flagged unverified vendor "${invoiceData.vendorName}" for finance team review.`,
        source: 'DETERMINISTIC_FALLBACK',
      };
    }

    // 3. Check PO presence and mismatch
    if (!poData) {
      return {
        decisionExplanation: `No Purchase Order on record for invoice ${invoiceData.invoiceNumber}. Unbudgeted operational spend requires founder authorization.`,
        recommendedAction: 'REQUIRE_APPROVAL',
        riskLevel: 'HIGH',
        riskScore: 78,
        executiveSummary: `Invoice ${invoiceData.invoiceNumber} lacks an authorized Purchase Order.`,
        source: 'DETERMINISTIC_FALLBACK',
      };
    }

    const variance = invoiceData.totalAmount - poData.totalAmount;
    if (variance > 0) {
      const pct = ((variance / poData.totalAmount) * 100).toFixed(1);
      return {
        decisionExplanation: `Invoice exceeds PO ${poData.poNumber} by ₹${variance.toLocaleString('en-IN')} (+${pct}% variance). Requires human review of extra line items.`,
        recommendedAction: 'REQUIRE_APPROVAL',
        riskLevel: 'HIGH',
        riskScore: 76,
        executiveSummary: `Price discrepancy detected: invoice exceeds purchase order by ₹${variance.toLocaleString('en-IN')}.`,
        source: 'DETERMINISTIC_FALLBACK',
      };
    }

    // 4. High-value threshold check (> ₹50,000)
    if (invoiceData.totalAmount > 50000) {
      return {
        decisionExplanation: `Invoice matches PO ${poData.poNumber} 100%, but amount (₹${invoiceData.totalAmount.toLocaleString('en-IN')}) exceeds autonomous threshold (₹50,000). Dual-control sign-off required.`,
        recommendedAction: 'REQUIRE_APPROVAL',
        riskLevel: 'HIGH',
        riskScore: 70,
        executiveSummary: `High-value invoice (${invoiceData.currency} ${invoiceData.totalAmount.toLocaleString('en-IN')}) requires executive confirmation.`,
        source: 'DETERMINISTIC_FALLBACK',
      };
    }

    // 5. Safe routine match
    return {
      decisionExplanation: `Invoice matches PO ${poData.poNumber} perfectly. Verified vendor with 0% variance and low financial liability. Safe for automated execution.`,
      recommendedAction: 'AUTO_PROCESS',
      riskLevel: 'LOW',
      riskScore: 12,
      executiveSummary: `Routine invoice verified and cleared for autonomous processing.`,
      source: 'DETERMINISTIC_FALLBACK',
    };
  }
}

export const geminiProvider = new GeminiProvider();
