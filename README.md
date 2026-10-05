# OpsPilot — Your Startup's AI Execution Layer

> **WCC Launchpad 30 — 30-Hour Hackathon (4–5 October 2026)**  
> **Official Track:** AGENTIC AI  
> **Tagline:** Your startup's AI execution layer.  
> **Core Differentiator:** AI should know when *NOT* to automate.

---

## 1. Problem Statement

Early-stage startup founders and lean finance operations teams face an operational bottleneck: invoices flood in via emails, PDF attachments, vendor portals, and messaging apps. Someone must manually:
- Read the invoice and extract line-item details
- Identify whether the vendor is authentic and verified
- Cross-reference internal Purchase Orders (POs) and budgets
- Reconcile quantities, tax calculations, and subtotals
- Hunt down price discrepancies, overages, and duplicate submissions
- Determine whether payment is safe or if it risks capital loss
- Request approvals across executives or finance leads
- Maintain an audit trail of who approved what and why

### The Core Failure of Traditional Approaches
1. **Manual Invoicing:** Labor-intensive, slow (averaging 3–5 days per invoice), error-prone, and causes missed discrepancies.
2. **Blind "Automated" AI Wrappers:** Blindly executing money transfers based on probabilistic LLM output risks catastrophic double payments, fraud, and budget overruns.

> **The Problem OpsPilot Solves:**  
> *How can a startup automate routine invoice operations without blindly giving an AI permission to make consequential financial decisions?*

---

## 2. Target Users & Problem Evidence

### Primary Persona
- **Early-stage Startup Founders & CTOs/CEOs:** High cognitive load, lean staff, cannot afford full-time accounts-payable departments, but cannot risk unmonitored cash leaks.

### Secondary Personas
- **Startup Operations Leads & Finance Administrators**
- **Agencies and Small Businesses (1–50 employees)**

### Real-World Problem Evidence
- Invoices regularly contain unexpected overages (e.g., cloud egress spikes, unbudgeted contractor hours, duplicate submissions after network resubmissions).
- Over 60% of invoice processing latency is spent waiting for human verification between siloed tools.
- Financial systems cannot tolerate hallucinated approvals or unchecked autonomy.

---

## 3. The Core Product Insight: Controlled Autonomy

OpsPilot is not simply an "AI that reads invoices."  
The breakthrough insight is:

```
                  INVOICE EVALUATED
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
     [ SAFE ]      [ UNCERTAIN ]    [ DANGEROUS ]
         │               │               │
         ▼               ▼               ▼
     AUTOMATE        ASK HUMAN         BLOCK
 (Routine match)  (Discrepancy /   (Duplicate /
                   High Value)      Fraud risk)
```

OpsPilot combines **deterministic business rules** with **semantic AI reasoning** to enforce mathematical safety rails. It automates routine, verified operations while stopping and demanding human sign-off whenever risk is detected.

---

## 4. Why Agentic AI?

Traditional software relies on rigid regex or brittle if-else statements that fail on unstructured invoice PDFs. Basic LLM wrappers return unstructured chat text with no guaranteed schema, no persistence, and no execution safety.

OpsPilot implements a true **Agentic Architecture**:
$$\text{Reason} \longrightarrow \text{Plan} \longrightarrow \text{Tool} \longrightarrow \text{Observe} \longrightarrow \text{Decide} \longrightarrow \text{Act} \longrightarrow \text{Verify}$$

1. **Autonomous Tool Selection:** The agent determines which tools are needed (`extractInvoice`, `getVendor`, `getPurchaseOrder`, `matchInvoiceToPO`, `detectAnomalies`, `calculateRisk`, `executePaymentAction`, `verifyAction`).
2. **Deterministic Risk Gating:** High-risk actions halt and yield to human oversight.
3. **Action Verification:** Every tool verifies its outcome post-execution before updating the audit log.

---

## 5. End-to-End Workflow (Workflow 1)

```
                 INVOICE ARRIVAL
             (Upload / Seeded Scenario)
                        │
                        ▼
                extractInvoice()
           (Multimodal data extraction)
                        │
                        ▼
            getVendor() + getPurchaseOrder()
             (Registry & database context)
                        │
                        ▼
               matchInvoiceToPO()
         (Reconciliation & Line-item diff)
                        │
                        ▼
               detectAnomalies()
     (Duplicates, variance %, math checks)
                        │
                        ▼
                calculateRisk()
        (Hybrid AI + Deterministic Engine)
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
    [ LOW RISK ]             [ HIGH / MEDIUM RISK ]   [ CRITICAL RISK ]
   (AUTO-PROCESS)            (REQUIRE_APPROVAL)            (BLOCK)
         │                             │                      │
         ▼                             ▼                      ▼
executePaymentAction()       createApprovalRequest()    policyEnforcer()
 (Simulated NEFT/RTGS)       (Operations Inbox Alert)   (Execution Blocked)
         │                             │                      │
         ▼                             ▼                      ▼
   verifyAction()           Human Reviewer Decides            │
(Proof verification)         /                  \             │
         │             [ Approve ]          [ Reject ]        │
         │                  │                    │            │
         │        executePaymentAction()   Action Cancelled   │
         │                  │                    │            │
         └──────────────────┼────────────────────┴────────────┘
                            │
                            ▼
                     writeAuditLog()
             (Cryptographic Ledger Trace)
```

---

## 6. Official Test Matrix & Seeded Scenarios

OpsPilot seeds 5 comprehensive scenarios covering every edge case:

| Scenario | Invoice # | Vendor | Invoice Amt | PO Baseline | Discrepancy | Risk Level | Expected Action |
|---|---|---|---|---|---|---|---|
| **Scenario A: Safe** | `INV-1041` | Acme Cloud Services | ₹42,500 | ₹42,500 | ₹0 (0% variance) | **LOW** (12/100) | **AUTO-PROCESS** (Simulated NEFT released) |
| **Scenario B: Mismatch** | `INV-1042` | Acme Cloud Services | ₹87,500 | ₹75,000 | +₹12,500 (+16.67%) | **HIGH** (78/100) | **REQUIRE APPROVAL** (Dispatched to inbox) |
| **Scenario C: Duplicate** | `INV-1042` (Dup) | Acme Cloud Services | ₹87,500 | ₹75,000 | Active record match | **CRITICAL** (99/100) | **BLOCK ACTION** (Execution terminated) |
| **Scenario D: Unknown Vendor** | `INV-9901` | Apex Strategic Consulting | ₹95,000 | Missing PO | Missing PO / Trust: 42% | **HIGH** (84/100) | **REQUIRE HUMAN REVIEW** (Founder sign-off) |
| **Scenario E: High Value** | `INV-5520` | CyberGuard Defense | ₹6,40,000 | ₹6,40,000 | ₹0 (Exceeds ₹50k Cap) | **HIGH** (72/100) | **REQUIRE DUAL APPROVAL** (Executive confirmation) |

---

## 7. Tool Layer Architecture

All interactions pass through strictly typed tools. The AI has **zero** arbitrary shell, SQL, or unrestricted system access.

```typescript
tools/
├── extractInvoice()         // Structured PDF/image extraction & confidence scoring
├── getVendor()              // Vendor registry trust score & bank metadata lookup
├── getPurchaseOrder()       // PO retrieval & line item validation
├── matchInvoiceToPO()       // Exact variance %, currency, and math reconciliation
├── checkDuplicateInvoice()  // Temporal duplication & fingerprint detection
├── detectAnomalies()        // Mathematical and compliance red-flag detection
├── calculateRisk()          // Hybrid deterministic + Gemini AI risk scoring
├── createApprovalRequest()  // Dispatches pending action to Operations Inbox
├── approveAction()          // Records human sign-off with audit signature
├── rejectAction()           // Cancels action with human-provided justification
├── executePaymentAction()   // Simulated DemoPaymentAdapter execution
├── verifyAction()           // Post-execution settlement & general ledger check
└── writeAuditLog()          // Tamper-evident operational event recording
```

---

## 8. Financial Action Safety Controls

OpsPilot adheres strictly to hackathon financial safety rules:
- **Demo Environment Isolation:** Uses `DemoPaymentAdapter` running on simulated NEFT/RTGS rails.
- **No Real Money Movement:** Clear simulated flags, masked accounts, and simulated bank acknowledgment proofs.
- **Judge-Safe Demonstration:** Judges can test every approval, execution, and verification cycle without real-world liability.

---

## 9. AI Architecture & Gemini Integration

- **Primary Provider:** Google Gemini API (`@google/generative-ai` / `gemini-1.5-flash`).
- **Resilient Fallback Engine:** If `GEMINI_API_KEY` is omitted or quota is exceeded, OpsPilot seamlessly activates its built-in **Deterministic Autonomous Rule Engine**. The application gracefully falls back without interrupting the workflow.
- **Zero Chain-of-Thought Exfiltration:** Private reasoning tokens are never exposed. OpsPilot presents concise, executive-facing **decision explanations** and structured factor breakdowns.

---

## 10. Technology Stack

- **Framework:** Next.js 14+ (App Router, Server & Client Components)
- **Language:** TypeScript 5.7 (Strict mode, zero `any` leaks)
- **Styling:** Tailwind CSS (Custom cool graphite & warm ivory palette)
- **3D Core:** Three.js (Interactive WebGL 3D AI Operations Core)
- **Icons:** Lucide React
- **AI SDK:** `@google/generative-ai` (Gemini API)
- **Testing:** Automated verification matrix (`npx tsx src/tests/testMatrix.ts` — 100% pass rate)

---

## 11. Quickstart & Local Setup

### 1. Clone & Install
```bash
git clone https://github.com/Ashaypatakare04/OpsPilot.git
cd OpsPilot
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

*(Optional)* Add your Gemini API key in `.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_APP_ENV=demo
```
*Note: If no key is supplied, OpsPilot operates reliably using its deterministic rule engine.*

### 3. Run Automated Test Suite
```bash
npx tsx src/tests/testMatrix.ts
```
Expected output:
```
RESULTS: 28 / 28 tests passed (100%)
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 12. Deployment

OpsPilot is optimized for Vercel deployment:
```bash
npm run build
```
Verify clean compilation with zero lint or type errors.

---

## 13. Exact 3-Minute Demo Script for Judges

1. **0:00 – 0:30 (The Hook & Landing Page):**  
   Open the landing page. Point out the interactive 3D Operations Core. Explain:  
   *"OpsPilot is your startup's AI execution layer. The key breakthrough is: AI should know when NOT to automate. Automate the routine, ask humans for the consequential, block the dangerous."*
2. **0:30 – 1:15 (Launch App & Process Safe Invoice):**  
   Click **Launch OpsPilot**. Open **Ingest Invoice** → Click **Scenario A (Safe Invoice)**. Show the timeline executing automatically:  
   *Extracted → PO Matched (0% variance) → Risk: LOW → Autonomous Payment Dispatched → Verified.*
3. **1:15 – 2:15 (The Discrepancy & Human Approval Gate):**  
   Click **Ingest Invoice** → Click **Scenario B (Mismatch Invoice)**. Show:  
   *Invoice ₹87,500 vs PO ₹75,000 (+16.7% variance). Risk: HIGH. Automatic action blocked.*  
   Open the **Operations Inbox** → Click **Review**. Point out the side-by-side reconciliation diff and the AI decision rationale. Click **Approve & Execute Payment**. Watch the timeline execute simulated settlement in real time.
4. **2:15 – 2:45 (Duplicate Protection & Critical Block):**  
   Click **Scenario C (Duplicate Submission)**. Show:  
   *Duplicate detected. Risk: CRITICAL. Execution permanently blocked.* Explain: *"This prevents startups from paying the same bill twice."*
5. **2:45 – 3:00 (Auditability & Policy Settings):**  
   Visit `/app/activity` to view the cryptographic audit trail. Visit `/app/settings` to demonstrate configurable autonomy thresholds (e.g. ₹50,000 auto limit). Conclude: *"OpsPilot brings speed to operations without ceding financial control."*

---

## 14. Disclosures & Hackathon Compliance

- **Event:** WCC Launchpad 30 Hackathon (4–5 October 2026)
- **Primary Track:** AGENTIC AI
- **AI Tools Used:** Antigravity AI Pair Programmer, Google Gemini API
- **Original Work:** 100% built during the official hackathon window. No pre-built boilerplate or templates used for core product logic.
- **Safety Compliance:** All payments are executed within an isolated demo adapter; no live bank credentials or real funds are processed.
