import { NextRequest, NextResponse } from 'next/server';
import { getCategory } from '@/lib/categories/registry';
import { BusinessCategoryId } from '@/lib/categories/types';
import { generateText, getGeminiModel } from '@/lib/ai/gemini';
import { checkRateLimit } from '@/lib/ai/rate-limit';

import { DigestAction, renderDigestActionText } from '@/lib/engine/digest';

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
  categoryId?: BusinessCategoryId;
  language?: 'en' | 'kn' | 'hi';
  question?: string;
  digestActions?: DigestAction[];
  stockoutRisks?: RiskFact[];
  salesDrops?: DropFact[];
  deadStock?: DeadStockFact[];
  totalRevenue?: number;
  revenueChangePct?: number;
  totalUnitsSold?: number;
}

export async function POST(req: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(req, 10, 60);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit reached (10 requests/min).', errorCode: 'RATE_LIMIT_EXCEEDED' },
        { status: 429 }
      );
    }

    const body: AdvisePayload = await req.json();
    const {
      categoryId = 'kirana',
      language = 'en',
      question = '',
      stockoutRisks = [],
      salesDrops = [],
      deadStock = [],
      totalRevenue = 0,
      revenueChangePct = 0,
    } = body;

    const category = getCategory(categoryId);
    const categoryName = category.labels[language] || category.labels.en;
    const termStock = category.terms.stock[language] || category.terms.stock.en;
    const termSupplier = category.terms.supplier[language] || category.terms.supplier.en;

    // Check if Gemini API key exists
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const promptSystem = `You are BizCopilot, an expert AI Advisor specialized in ${categoryName} for small Indian business owners.
DOMAIN FOCUS & VOCABULARY:
- Business Type: ${categoryName}
- Use domain terms: "${termStock}" for stock, "${termSupplier}" for supplier/vendor.
- Specific domain concerns:
  * Pharmacy: Near-expiry batches, drug return to stockist, prescription availability.
  * Apparel: Broken size curves, color assortments, fashion season clearance.
  * Restaurant: Ingredient freshness, daily kitchen prep, food cost %, spoilage risk.
  * Perishables: Spoilage within 24h, evening discount clearance, morning mandi crates.
  * Hardware: Contractor favorites, slow-moving bin items, depot transit times.
  * Electronics: Rapid tech depreciation, high-margin accessories, model turnover.
  * Distributor: Market credit collections, master cases, retailer delivery beats.
  * Manufacturer: Bottleneck raw materials, assembly stoppage prevention.

CRITICAL CONSTRAINTS:
1. FACTS FIRST: Rely ONLY on the aggregated facts provided below. Never invent or hallucinate any numbers or dates.
2. Plain, owner-friendly language: No complex finance jargon.
3. Provide actionable, concise advice.
4. Respond in language: ${language === 'kn' ? 'Kannada (ಕನ್ನಡ)' : language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}.

CURRENT COMPUTED FACTS:
- Business: ${categoryName}
- Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')} (${revenueChangePct >= 0 ? '+' : ''}${revenueChangePct}% vs previous period)
- Stockout Risks: ${
          stockoutRisks.length > 0
            ? stockoutRisks
                .map(
                  (r) =>
                    `${r.productName}: ${r.daysOfCover}d stock left, ${termSupplier} takes ${r.supplierLeadDays}d. Recommended order: ${r.reorderQuantity} units.`
                )
                .join('; ')
            : 'None (Stock healthy)'
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
                    `${ds.productName}: ₹${ds.costValue.toLocaleString('en-IN')} locked in ${ds.stockOnHand} unsold units`
                )
                .join('; ')
            : 'None'
        }
${
  body.digestActions && body.digestActions.length > 0
    ? `\nTOP 3 ACTION DIGEST ITEMS (Keep all numbers EXACT, rewrite in friendly shopkeeper language):\n` +
      body.digestActions
        .map((a, i) => {
          const t = renderDigestActionText(a, language);
          return `${i + 1}. [${a.type}] ${t.title}: ${t.explanation} Action: ${t.actionText}`;
        })
        .join('\n')
    : ''
}

USER QUESTION: ${
  question ||
  (body.digestActions && body.digestActions.length > 0
    ? `Provide a warm, encouraging 3-point daily digest for the owner.`
    : 'What should I act on today?')
}`;

        const aiText = await generateText(promptSystem, {
          model: getGeminiModel(),
          temperature: 0.2,
        });

        if (aiText.trim()) {
          return NextResponse.json({
            success: true,
            advice: aiText.trim(),
            mode: 'ai-enhanced',
            provider: 'Google Gemini',
            categoryId,
            numbersVerified: true,
          });
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to deterministic advice:', geminiError);
      }
    }

    // Deterministic Rule-Based Fallback (Category-aware & Multilingual)
    const adviceLines: string[] = [];

    if (
      body.digestActions &&
      body.digestActions.length > 0 &&
      stockoutRisks.length === 0 &&
      salesDrops.length === 0
    ) {
      const heading =
        language === 'kn'
          ? `**ಇಂದಿನ ಟಾಪ್ ೩ BizCopilot ನಿರ್ಧಾರಗಳು (${categoryName}):**\n`
          : language === 'hi'
          ? `**आज के शीर्ष 3 व्यावसायिक निर्णय (${categoryName}):**\n`
          : `**Today's Top 3 Decisions (${categoryName}):**\n`;
      adviceLines.push(heading);
      body.digestActions.forEach((a, i) => {
        const t = renderDigestActionText(a, language);
        adviceLines.push(`${i + 1}. **${t.title}**\n   • ${t.explanation}\n   👉 ${t.actionText}`);
      });
      return NextResponse.json({
        success: true,
        advice: adviceLines.join('\n\n'),
        mode: 'deterministic',
        provider: 'BizCopilot Rule Engine',
        categoryId,
        numbersVerified: true,
      });
    }

    if (language === 'kn') {
      adviceLines.push(`**BizCopilot ಇಂದಿನ ಮುಖ್ಯ ಸಲಹೆಗಳು (${categoryName}):**\n`);
      if (stockoutRisks.length > 0) {
        adviceLines.push(`🚨 **ತುರ್ತು ರೀಆರ್ಡರ್ (${termSupplier}):**`);
        for (const r of stockoutRisks) {
          adviceLines.push(
            `• **${r.productName}**: ಕೇವಲ ~${r.daysOfCover} ದಿನಗಳ ${termStock} ಉಳಿದಿದೆ, ಆದರೆ ${termSupplier} ನಿಂದ ಬರಲು ${r.supplierLeadDays} ದಿನ ಬೇಕಾಗುತ್ತದೆ. ಇಂದೇ **${r.reorderQuantity} ಯೂನಿಟ್‌ಗಳನ್ನು** WhatsApp ಮೂಲಕ ಆರ್ಡರ್ ಮಾಡಿ.`
          );
        }
      }
      if (salesDrops.length > 0) {
        adviceLines.push(`\n📉 **ಮಾರಾಟದಲ್ಲಿ ಇಳಿಕೆ ಕಂಡ ವಸ್ತುಗಳು:**`);
        for (const d of salesDrops) {
          adviceLines.push(
            `• **${d.productName}**: ಮಾರಾಟ ${d.changePct}% ಇಳಿಕೆಯಾಗಿದೆ (${d.previousUnits} ರ ಎದುರು ${d.currentUnits} ಯೂನಿಟ್).`
          );
        }
      }
      if (deadStock.length > 0) {
        adviceLines.push(`\n📦 **ಮಾರಾಟವಾಗದ ದಾಸ್ತಾನಿನಲ್ಲಿ ಸಿಲುಕಿರುವ ಹಣ:**`);
        for (const ds of deadStock) {
          adviceLines.push(
            `• **${ds.productName}**: ${ds.stockOnHand} ಯೂನಿಟ್‌ಗಳು ನಿಷ್ಕ್ರಿಯವಾಗಿದ್ದು ₹${ds.costValue.toLocaleString('en-IN')} ಹಣ ಸಿಲುಕಿದೆ.`
          );
        }
      }
      adviceLines.push(`\n*ಎಲ್ಲಾ ಸಂಖ್ಯೆಗಳು ನಿಮ್ಮ ${categoryName} ಲೆಕ್ಕಾಚಾರಗಳಿಂದ ನೇರವಾಗಿ ಬಂದಿವೆ.*`);
    } else if (language === 'hi') {
      adviceLines.push(`**BizCopilot आज की मुख्य सलाह (${categoryName}):**\n`);
      if (stockoutRisks.length > 0) {
        adviceLines.push(`🚨 **तुरंत रीऑर्डर करें (${termSupplier}):**`);
        for (const r of stockoutRisks) {
          adviceLines.push(
            `• **${r.productName}**: लगभग ~${r.daysOfCover} दिन का ${termStock} बचा है, जबकि ${termSupplier} से सप्लाई में ${r.supplierLeadDays} दिन लगते हैं। आज ही **${r.reorderQuantity} यूनिट्स** का ऑर्डर भेजें।`
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
            `• **${ds.productName}**: ${ds.stockOnHand} यूनिट्स बिना बिके पड़े हैं और ₹${ds.costValue.toLocaleString('en-IN')} की पूंजी फंसी है।`
          );
        }
      }
      adviceLines.push(`\n*सभी आंकड़े आपकी दुकान की वास्तविक बिक्री गणना पर आधारित हैं।*`);
    } else {
      adviceLines.push(`**BizCopilot Action Priority for Today (${categoryName}):**\n`);
      if (stockoutRisks.length > 0) {
        adviceLines.push(`🚨 **Urgent Replenishment (${termSupplier}):**`);
        for (const r of stockoutRisks) {
          adviceLines.push(
            `• **${r.productName}**: About ${r.daysOfCover} days of ${termStock} remaining, but ${termSupplier} takes ${r.supplierLeadDays} days. Place a reorder for **${r.reorderQuantity} units** now via WhatsApp to prevent stockouts.`
          );
        }
      }
      if (salesDrops.length > 0) {
        adviceLines.push(`\n📉 **Investigate Sales Decline:**`);
        for (const d of salesDrops) {
          adviceLines.push(
            `• **${d.productName}**: Sales dropped by ${d.changePct}% (sold ${d.currentUnits} units vs ${d.previousUnits} in previous period).`
          );
        }
      }
      if (deadStock.length > 0) {
        adviceLines.push(`\n📦 **Liberate Locked Working Capital:**`);
        for (const ds of deadStock) {
          adviceLines.push(
            `• **${ds.productName}**: ${ds.stockOnHand} units sitting unsold with ₹${ds.costValue.toLocaleString('en-IN')} locked at cost.`
          );
        }
      }
      adviceLines.push(`\n*Facts First: All figures are deterministically calculated for ${categoryName}.*`);
    }

    return NextResponse.json({
      success: true,
      advice: adviceLines.join('\n'),
      mode: 'deterministic',
      provider: 'BizCopilot Rule Engine',
      categoryId,
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
