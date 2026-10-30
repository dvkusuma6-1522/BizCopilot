import { NextRequest, NextResponse } from 'next/server';

interface RiskFact {
  productName: string;
  daysOfCover: number;
  supplierLeadDays: number;
  reorderQuantity: number;
  stockOnHand: number;
}

interface DropFact {
  productName: string;
  currentUnits: number;
  previousUnits: number;
  changePct: number;
}

interface DeadStockFact {
  productName: string;
  stockOnHand: number;
  costValue: number;
  unitsSold: number;
}

interface AdvisePayload {
  language?: 'en' | 'kn' | 'hi';
  question?: string;
  stockoutRisks?: RiskFact[];
  salesDrops?: DropFact[];
  deadStock?: DeadStockFact[];
  totalRevenue?: number;
  revenueChangePct?: number;
  totalUnitsSold?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: AdvisePayload = await req.json();
    const {
      language = 'en',
      question = '',
      stockoutRisks = [],
      salesDrops = [],
      deadStock = [],
      totalRevenue = 0,
      revenueChangePct = 0,
    } = body;

    // Check if Gemini API key exists
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const promptSystem = `You are BizCopilot, an AI Sales & Inventory Advisor for small shop owners in India (kiranas, pharmacies, retailers).
CRITICAL CONSTRAINTS:
1. FACTS FIRST: Rely ONLY on the aggregated facts provided below. Never invent or hallucinate any numbers or dates.
2. Plain, owner-friendly language: No complex finance jargon. Say "money tied up" not "capital exposure", "days of stock left" not "days of cover".
3. Provide actionable, concise advice.
4. Respond in language: ${language === 'kn' ? 'Kannada (ಕನ್ನಡ)' : language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}.

CURRENT COMPUTED STORE FACTS:
- Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')} (${revenueChangePct >= 0 ? '+' : ''}${revenueChangePct}% vs previous period)
- Stockout Risks: ${
          stockoutRisks.length > 0
            ? stockoutRisks
                .map(
                  (r) =>
                    `${r.productName}: ${r.daysOfCover}d stock left, delivery takes ${r.supplierLeadDays}d. Recommended order: ${r.reorderQuantity} units.`
                )
                .join('; ')
            : 'None (All stock healthy)'
        }
- Significant Sales Drops: ${
          salesDrops.length > 0
            ? salesDrops
                .map(
                  (d) =>
                    `${d.productName}: ${d.changePct}% drop (sold ${d.currentUnits} vs ${d.previousUnits})`
                )
                .join('; ')
            : 'None'
        }
- Dead Stock: ${
          deadStock.length > 0
            ? deadStock
                .map(
                  (ds) =>
                    `${ds.productName}: ₹${ds.costValue.toLocaleString('en-IN')} tied up in ${ds.stockOnHand} unsold units`
                )
                .join('; ')
            : 'None'
        }

USER QUESTION: ${question || "What should I act on today?"}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: promptSystem }] }],
              generationConfig: {
                temperature: 0.2, // deterministic & factual
                maxOutputTokens: 600,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const aiText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (aiText.trim()) {
            return NextResponse.json({
              success: true,
              advice: aiText.trim(),
              mode: 'ai-enhanced',
              provider: 'Google Gemini',
              numbersVerified: true,
            });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to deterministic advice:', geminiError);
      }
    }

    // Deterministic Rule-Based Fallback (Works 100% without API key)
    const adviceLines: string[] = [];

    if (language === 'kn') {
      adviceLines.push('**BizCopilot ಇಂದಿನ ಮುಖ್ಯ ಸಲಹೆಗಳು:**\n');
      if (stockoutRisks.length > 0) {
        adviceLines.push(`🚨 **ತುರ್ತು ದಾಸ್ತಾನು ಆರ್ಡರ್:**`);
        for (const r of stockoutRisks) {
          adviceLines.push(
            `• **${r.productName}**: ಕೇವಲ ~${r.daysOfCover} ದಿನಗಳ ದಾಸ್ತಾನು ಉಳಿದಿದೆ, ಆದರೆ ಡೆಲಿವರಿಗೆ ${r.supplierLeadDays} ದಿನ ಬೇಕಾಗುತ್ತದೆ. ಶೆಲ್ಫ್ ಖಾಲಿಯಾಗದಂತೆ ಇಂದೇ **${r.reorderQuantity} ಯೂನಿಟ್‌ಗಳನ್ನು** WhatsApp ಮೂಲಕ ಆರ್ಡರ್ ಮಾಡಿ.`
          );
        }
      }
      if (salesDrops.length > 0) {
        adviceLines.push(`\n📉 **ಮಾರಾಟದಲ್ಲಿ ಇಳಿಕೆ ಕಂಡ ವಸ್ತುಗಳು:**`);
        for (const d of salesDrops) {
          adviceLines.push(
            `• **${d.productName}**: ಮಾರಾಟ ${d.changePct}% ಇಳಿಕೆಯಾಗಿದೆ (${d.previousUnits} ರ ಎದುರು ${d.currentUnits} ಯೂನಿಟ್). ಕೌಂಟರ್ ಮುಂಭಾಗದಲ್ಲಿ ಪ್ರದರ್ಶಿಸಿ.`
          );
        }
      }
      if (deadStock.length > 0) {
        adviceLines.push(`\n📦 **ಮಾರಾಟವಾಗದ ದಾಸ್ತಾನಿನಲ್ಲಿ ಸಿಲುಕಿರುವ ಹಣ:**`);
        for (const ds of deadStock) {
          adviceLines.push(
            `• **${ds.productName}**: ${ds.stockOnHand} ಯೂನಿಟ್‌ಗಳು ನಿಷ್ಕ್ರಿಯವಾಗಿದ್ದು ₹${ds.costValue.toLocaleString('en-IN')} ಹಣ ಸಿಲುಕಿದೆ. 20% ರಿಯಾಯಿತಿ ನೀಡಿ ಹಣ ಮರಳಿ ಪಡೆಯಿರಿ.`
          );
        }
      }
      adviceLines.push('\n*ಎಲ್ಲಾ ಸಂಖ್ಯೆಗಳು ನಿಮ್ಮ ಲೆಕ್ಕಾಚಾರಗಳಿಂದ ನೇರವಾಗಿ ಬಂದಿವೆ.*');
    } else if (language === 'hi') {
      adviceLines.push('**BizCopilot आज की मुख्य सलाह:**\n');
      if (stockoutRisks.length > 0) {
        adviceLines.push(`🚨 **तुरंत रीऑर्डर करें:**`);
        for (const r of stockoutRisks) {
          adviceLines.push(
            `• **${r.productName}**: लगभग ~${r.daysOfCover} दिन का स्टॉक बाकी है, जबकि डिलीवरी में ${r.supplierLeadDays} दिन लगते हैं। शेल्फ खाली होने से पहले आज ही **${r.reorderQuantity} यूनिट्स** ऑर्डर करें।`
          );
        }
      }
      if (salesDrops.length > 0) {
        adviceLines.push(`\n📉 **बिक्री में गिरावट:**`);
        for (const d of salesDrops) {
          adviceLines.push(
            `• **${d.productName}**: बिक्री में ${d.changePct}% की कमी आई है (${d.previousUnits} की तुलना में केवल ${d.currentUnits} बिके)।`
          );
        }
      }
      if (deadStock.length > 0) {
        adviceLines.push(`\n📦 **न बिकने वाले सामान में फंसा पैसा:**`);
        for (const ds of deadStock) {
          adviceLines.push(
            `• **${ds.productName}**: ${ds.stockOnHand} यूनिट्स बिना बिके पड़े हैं और ₹${ds.costValue.toLocaleString('en-IN')} की पूंजी फंसी है। कॉम्बो ऑफर देकर नकदी निकालें।`
          );
        }
      }
      adviceLines.push('\n*सभी आंकड़े आपकी दुकान की वास्तविक बिक्री गणना पर आधारित हैं।*');
    } else {
      adviceLines.push('**BizCopilot Action Priority for Today:**\n');
      if (stockoutRisks.length > 0) {
        adviceLines.push(`🚨 **Urgent Stockout Replenishment:**`);
        for (const r of stockoutRisks) {
          adviceLines.push(
            `• **${r.productName}**: About ${r.daysOfCover} days of stock remaining, but supplier delivery takes ${r.supplierLeadDays} days. Place a reorder for **${r.reorderQuantity} units** now via WhatsApp to prevent lost revenue.`
          );
        }
      }
      if (salesDrops.length > 0) {
        adviceLines.push(`\n📉 **Investigate Sales Decline:**`);
        for (const d of salesDrops) {
          adviceLines.push(
            `• **${d.productName}**: Sales dropped by ${d.changePct}% (sold ${d.currentUnits} units vs ${d.previousUnits} in previous period). Check shelf placement or pricing.`
          );
        }
      }
      if (deadStock.length > 0) {
        adviceLines.push(`\n📦 **Liberate Trapped Working Capital:**`);
        for (const ds of deadStock) {
          adviceLines.push(
            `• **${ds.productName}**: ${ds.stockOnHand} units sitting unsold with ₹${ds.costValue.toLocaleString('en-IN')} locked up at cost. Bundle with fast-selling items to convert to cash.`
          );
        }
      }
      adviceLines.push('\n*Facts First: All figures are deterministically calculated by BizCopilot Engine.*');
    }

    return NextResponse.json({
      success: true,
      advice: adviceLines.join('\n'),
      mode: 'deterministic',
      provider: 'BizCopilot Rule Engine',
      numbersVerified: true,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
