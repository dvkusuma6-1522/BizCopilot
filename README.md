# BizCopilot 🇮🇳

> **AI Sales & Inventory Advisor for Small Shop Owners in India**  
> Kirana, Pharmacy, Apparel, Perishables, Restaurant, Hardware, Electronics, and more.  
> Trilingual interface in **ಕನ್ನಡ (Kannada)**, **हिन्दी (Hindi)**, and **English**.  
> **FACTS FIRST:** Local-first calculations via IndexedDB (Dexie). Raw sales transactions never leave the phone.

---

## Features

- **Local-First Privacy:** All sales records and inventory levels reside in the browser via IndexedDB (Dexie).
- **Google Gemini Integration:** Single AI provider using the official `@google/genai` SDK and `gemini-2.5-flash` model.
  - **Streaming AI Advisor (`/api/advisor`):** Explains sales velocity, stockout threats, and festival prep using only aggregated metric summaries.
  - **Supplier Bill Scanner (`/api/bill-extract`):** Multimodal photo extraction of supplier bills directly into inventory stock with structured JSON validation.
- **Fast Daily Entry:**
  - On-screen touch keypad (0–9, +1, +5, +10) preventing mobile keyboard jumping.
  - Camera barcode scanner (EAN-13 / UPC) with 1-tap stock/sales actions.
  - Voice entry in Kannada, Hindi, and Indian English with deterministic quantity and item parsing.
  - 5-second undo toast on all reversible transactions.
- **Festival & Peak-Day Calendar:** 2026–2027 Indian calendar (Ugadi, Diwali, Sankranti, Ganesh Chaturthi, Monsoon, Wedding Season) with stock cover alerts.
- **Safety & Rate Limiting:** 10 requests/minute per IP (Upstash Redis with pure in-memory sliding window fallback). Image data and full prompts are never logged.

---

## Quickstart & Local Setup

### 1. Prerequisites
- Node.js `v20` or higher
- npm `v10` or higher

### 2. Install Dependencies
```bash
npm install
```

### 3. Get a Free Google Gemini API Key
BizCopilot runs completely on Google Gemini's free tier (no credit card required):
1. Visit [Google AI Studio](https://aistudio.google.com/apikey).
2. Sign in with your Google account.
3. Click **"Create API key"** and copy your key.

### 4. Configure Environment Variables
Copy the `.env.example` file to `.env.local`:
```bash
cp .env.example .env.local
```

Open `.env.local` and add your Gemini API key:
```ini
# Google Gemini API Configuration (Server-side only)
GEMINI_API_KEY=AIzaSy...your_actual_key_here...
GEMINI_MODEL=gemini-2.5-flash

# Optional: Upstash Redis for distributed rate limiting across serverless instances
# If omitted, BizCopilot automatically uses an in-memory sliding window fallback
# UPSTASH_REDIS_REST_URL=https://...
# UPSTASH_REDIS_REST_TOKEN=...
```

> **Security Note:** `GEMINI_API_KEY` is strictly used server-side in Next.js Route Handlers (`app/api/`). It is never exposed to the client bundle or prefixed with `NEXT_PUBLIC_`. `.env.local` is included in `.gitignore`.

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on your desktop or mobile browser.

### 6. Run Unit Tests & Build Verification
```bash
# Run all Vitest unit tests (deterministic engine, voice parser, Gemini client, API routes)
npm test

# Verify production Next.js build
npm run build
```

---

## Deploying to Vercel (Hobby Free Tier)

1. Push your repository to GitHub.
2. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New" -> "Project"**.
3. Import your GitHub repository.
4. Under **"Environment Variables"**, add:
   - `GEMINI_API_KEY`: Your key from Google AI Studio.
   - `GEMINI_MODEL`: `gemini-2.5-flash` (or your preferred Gemini model).
   - *(Optional)* `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN` if you want distributed rate limiting.
5. Click **Deploy**. Vercel will build and deploy the Next.js App Router PWA automatically.

---

## AI Architecture & Privacy Principles

1. **Facts First:** AI never invents numbers. All metrics (days of cover, revenue changes, reorder quantities) are deterministically computed on device first.
2. **Aggregated Facts Only:** Only high-level metric summaries (e.g., top 5 selling items, products with < 3 days stock) are passed to the AI advisor route. Raw transaction history and customer identifiers never leave the device.
3. **Transient OCR:** Photos of supplier bills are sent to Gemini solely to transcribe printed line items into structured JSON. Images are processed in memory and never persisted or saved on server storage.
4. **Offline Resilience:** If the Gemini API key is missing or quota is exhausted, BizCopilot automatically falls back to deterministic rule-based advice in the owner's language without crashing.
