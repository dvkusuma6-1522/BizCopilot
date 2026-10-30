import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  generateTextStream,
  generateText,
  isQuotaExceededError,
  GeminiKeyMissingError,
  GeminiQuotaExceededError,
  getGeminiModel,
} from '@/lib/ai/gemini';
import { checkRateLimit } from '@/lib/ai/rate-limit';

const AdvisorPayloadSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty'),
  language: z.enum(['en', 'kn', 'hi']).default('en'),
  stream: z.boolean().default(true),
  metrics: z.object({
    storeName: z.string().optional(),
    categoryName: z.string().optional(),
    topSellers: z.array(
      z.object({
        name: z.string(),
        unitsSold: z.number(),
        revenue: z.number(),
      })
    ).default([]),
    lowStock: z.array(
      z.object({
        name: z.string(),
        daysOfStockLeft: z.number(),
        supplierLeadDays: z.number(),
        recommendedReorder: z.number(),
        stockOnHand: z.number().optional(),
      })
    ).default([]),
    weeklySalesTrend: z.array(
      z.object({
        date: z.string(),
        revenue: z.number(),
        units: z.number(),
      })
    ).default([]),
    upcomingFestivals: z.array(
      z.object({
        name: z.string(),
        daysAway: z.number(),
        tip: z.string().optional(),
      })
    ).default([]),
    deadStock: z.array(
      z.object({
        name: z.string(),
        stockOnHand: z.number(),
        lockedCost: z.number(),
      })
    ).optional(),
    totalRevenue: z.number().optional(),
    revenueChangePct: z.number().optional(),
  }),
});

export type AdvisorPayload = z.infer<typeof AdvisorPayloadSchema>;

/**
 * Builds deterministic fallback advice when Gemini is not configured or offline.
 */
function buildDeterministicAdvice(payload: AdvisorPayload): string {
  const { language, metrics } = payload;
  const store = metrics.storeName || 'Shop';

  if (language === 'kn') {
    const lines = [`**${store} - ಇಂದಿನ ವ್ಯಾಪಾರ ಸಲಹೆ:**\n`];
    if (metrics.lowStock.length > 0) {
      lines.push('🚨 **ತುರ್ತು ರೀಆರ್ಡರ್ ಅಗತ್ಯವಿರುವ ಸರಕುಗಳು:**');
      for (const item of metrics.lowStock.slice(0, 3)) {
        lines.push(`• **${item.name}**: ಕೇವಲ ~${item.daysOfStockLeft} ದಿನಗಳ ದಾಸ್ತಾನು ಉಳಿದಿದೆ. ಇಂದೇ **${item.recommendedReorder} ಯೂನಿಟ್** ಆರ್ಡರ್ ಮಾಡಿ.`);
      }
    }
    if (metrics.topSellers.length > 0) {
      lines.push('\n⭐ **ಹೆಚ್ಚು ಮಾರಾಟವಾದ ಸರಕುಗಳು:**');
      for (const item of metrics.topSellers.slice(0, 3)) {
        lines.push(`• **${item.name}**: ${item.unitsSold} ಯೂನಿಟ್‌ಗಳು ಮಾರಾಟ (₹${item.revenue.toLocaleString('en-IN')})`);
      }
    }
    if (metrics.upcomingFestivals.length > 0) {
      const f = metrics.upcomingFestivals[0];
      lines.push(`\n🎉 **ಮುಂದಿನ ಹಬ್ಬ:** ${f.name} ಇನ್ನಿಷ್ಟು ${f.daysAway} ದಿನಗಳಲ್ಲಿದೆ. ${f.tip || 'ದಾಸ್ತಾನು ಮೊದಲೇ ಸಿದ್ಧವಾಗಿರಲಿ.'}`);
    }
    lines.push('\n*ಎಲ್ಲಾ ಲೆಕ್ಕಾಚಾರಗಳು ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿರುವ ಮಾರಾಟ ಮಾಹಿತಿಯಿಂದ ನೇರವಾಗಿ ಲೆಕ್ಕಹಾಕಲಾಗಿದೆ.*');
    return lines.join('\n');
  }

  if (language === 'hi') {
    const lines = [`**${store} - आज की व्यापारिक सलाह:**\n`];
    if (metrics.lowStock.length > 0) {
      lines.push('🚨 **तुरंत रीऑर्डर करने योग्य सामान:**');
      for (const item of metrics.lowStock.slice(0, 3)) {
        lines.push(`• **${item.name}**: केवल ~${item.daysOfStockLeft} दिन का स्टॉक बचा है। आज ही **${item.recommendedReorder} यूनिट्स** का ऑर्डर दें।`);
      }
    }
    if (metrics.topSellers.length > 0) {
      lines.push('\n⭐ **सबसे ज्यादा बिकने वाला सामान:**');
      for (const item of metrics.topSellers.slice(0, 3)) {
        lines.push(`• **${item.name}**: ${item.unitsSold} यूनिट्स बिकीं (₹${item.revenue.toLocaleString('en-IN')})`);
      }
    }
    if (metrics.upcomingFestivals.length > 0) {
      const f = metrics.upcomingFestivals[0];
      lines.push(`\n🎉 **आगामी त्योहार:** ${f.name} आने में ${f.daysAway} दिन बाकी हैं। ${f.tip || 'सप्लाई समय पर मंगाएं।'}`);
    }
    lines.push('\n*सभी आंकड़े आपकी दुकान के वास्तविक रिकॉर्ड पर आधारित हैं।*');
    return lines.join('\n');
  }

  // English fallback
  const lines = [`**${store} - Action Advice for Today:**\n`];
  if (metrics.lowStock.length > 0) {
    lines.push('🚨 **Urgent Stock Replenishment:**');
    for (const item of metrics.lowStock.slice(0, 3)) {
      lines.push(`• **${item.name}**: ~${item.daysOfStockLeft} days cover left (Lead time: ${item.supplierLeadDays}d). Reorder **${item.recommendedReorder} units** today.`);
    }
  }
  if (metrics.topSellers.length > 0) {
    lines.push('\n⭐ **Top Selling Products:**');
    for (const item of metrics.topSellers.slice(0, 3)) {
      lines.push(`• **${item.name}**: ${item.unitsSold} units sold (₹${item.revenue.toLocaleString('en-IN')})`);
    }
  }
  if (metrics.upcomingFestivals.length > 0) {
    const f = metrics.upcomingFestivals[0];
    lines.push(`\n🎉 **Upcoming Peak/Festival:** ${f.name} in ${f.daysAway} days. ${f.tip || 'Order inventory ahead to avoid supplier rush.'}`);
  }
  lines.push('\n*Facts First: All numbers deterministically computed from your store records.*');
  return lines.join('\n');
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting (10 requests/minute per IP)
    const rateLimit = await checkRateLimit(req, 10, 60);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit reached (10 requests/min). Please wait a moment before asking again.',
          errorCode: 'RATE_LIMIT_EXCEEDED',
        },
        { status: 429 }
      );
    }

    // 2. Validate request JSON
    const json = await req.json();
    const parseResult = AdvisorPayloadSchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid advisor payload: ' + parseResult.error.issues.map((i) => i.message).join(', '),
          errorCode: 'INVALID_INPUT',
        },
        { status: 400 }
      );
    }

    const { question, language, metrics, stream = true } = parseResult.data;

    // 3. Build system instruction and contextual user prompt
    const langLabel =
      language === 'kn' ? 'Kannada (ಕನ್ನಡ)' : language === 'hi' ? 'Hindi (हिन्दी)' : 'English';

    const systemInstruction = `You are BizCopilot, an expert and practical AI sales and inventory advisor for small shop owners in India.
CRITICAL OPERATING RULES:
1. FACTS FIRST: Rely ONLY on the numbers provided in the context below. Never invent or hallucinate any numbers, product names, or financial figures.
2. User Language: You must answer in ${langLabel}.
3. Plain-spoken & Actionable: Keep responses short, direct, and focused on today's actions. Never use confusing corporate jargon.
4. What to Do: Suggest exact reorder quantities, identify what stock is locked or at risk of stocking out, and how to prepare for upcoming festivals.
5. If the user asks general questions outside their store data, politely remind them you advise on their verified store facts.`;

    const userPrompt = `STORE SUMMARY FACTS:
- Business: ${metrics.storeName || 'Shop'} (${metrics.categoryName || 'General Store'})
${metrics.totalRevenue !== undefined ? `- Total Revenue: ₹${metrics.totalRevenue.toLocaleString('en-IN')} (${metrics.revenueChangePct !== undefined && metrics.revenueChangePct >= 0 ? '+' : ''}${metrics.revenueChangePct ?? 0}% vs previous period)` : ''}

TOP SELLING PRODUCTS:
${
  metrics.topSellers.length > 0
    ? metrics.topSellers.map((s) => `• ${s.name}: ${s.unitsSold} units (₹${s.revenue.toLocaleString('en-IN')})`).join('\n')
    : 'No top seller data available.'
}

STOCKOUT RISKS & LOW STOCK (REORDER TODAY):
${
  metrics.lowStock.length > 0
    ? metrics.lowStock.map((l) => `• ${l.name}: ~${l.daysOfStockLeft} days cover left (Supplier takes ${l.supplierLeadDays} days). Reorder: ${l.recommendedReorder} units.`).join('\n')
    : 'All stock levels healthy.'
}

WEEKLY SALES TREND:
${
  metrics.weeklySalesTrend.length > 0
    ? metrics.weeklySalesTrend.map((t) => `• ${t.date}: ₹${t.revenue.toLocaleString('en-IN')} (${t.units} units)`).join('\n')
    : 'No weekly trend data available.'
}

UPCOMING FESTIVALS & PEAKS:
${
  metrics.upcomingFestivals.length > 0
    ? metrics.upcomingFestivals.map((f) => `• ${f.name}: in ${f.daysAway} days.${f.tip ? ` Tip: ${f.tip}` : ''}`).join('\n')
    : 'No major festivals in the next 30 days.'
}

${
  metrics.deadStock && metrics.deadStock.length > 0
    ? `DEAD STOCK (UNSOLD ITEMS):\n` +
      metrics.deadStock.map((d) => `• ${d.name}: ${d.stockOnHand} unsold units (₹${d.lockedCost.toLocaleString('en-IN')} locked cost)`).join('\n')
    : ''
}

USER QUESTION:
${question}`;

    // 4. If streaming is requested and Gemini is configured
    if (stream) {
      try {
        const textStream = generateTextStream(userPrompt, {
          model: getGeminiModel(),
          systemInstruction,
          temperature: 0.2,
          timeoutMs: 30000,
        });

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of textStream) {
                controller.enqueue(encoder.encode(chunk));
              }
              controller.close();
            } catch (streamErr) {
              if (isQuotaExceededError(streamErr) || streamErr instanceof GeminiQuotaExceededError) {
                controller.enqueue(
                  encoder.encode(
                    '\n\n[QUOTA_EXCEEDED: Daily AI quota reached. Showing rule-based advice.]\n\n' +
                      buildDeterministicAdvice(parseResult.data)
                  )
                );
              } else if (streamErr instanceof GeminiKeyMissingError) {
                controller.enqueue(
                  encoder.encode(
                    '\n\n[OFFLINE_MODE: API key not set. Showing rule-based advice.]\n\n' +
                      buildDeterministicAdvice(parseResult.data)
                  )
                );
              } else {
                controller.enqueue(encoder.encode('\n\n[Error generating full advice. Please try again.]'));
              }
              controller.close();
            }
          },
        });

        return new Response(readable, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'X-Advisor-Model': getGeminiModel(),
          },
        });
      } catch (streamInitErr) {
        if (streamInitErr instanceof GeminiKeyMissingError) {
          return new Response(buildDeterministicAdvice(parseResult.data), {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'X-Advisor-Mode': 'deterministic',
            },
          });
        }
        throw streamInitErr;
      }
    }

    // 5. Non-streaming fallback
    try {
      const text = await generateText(userPrompt, {
        model: getGeminiModel(),
        systemInstruction,
        temperature: 0.2,
      });

      return NextResponse.json({
        success: true,
        advice: text,
        mode: 'ai-enhanced',
        model: getGeminiModel(),
      });
    } catch (nonStreamErr) {
      if (
        nonStreamErr instanceof GeminiKeyMissingError ||
        isQuotaExceededError(nonStreamErr) ||
        nonStreamErr instanceof GeminiQuotaExceededError
      ) {
        return NextResponse.json({
          success: true,
          advice: buildDeterministicAdvice(parseResult.data),
          mode: 'deterministic',
          fallback: true,
        });
      }
      throw nonStreamErr;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown advisor error';
    console.error('Advisor route error:', msg);
    return NextResponse.json(
      {
        success: false,
        error: 'Advisor service encountered an error. Please try again.',
        errorCode: 'ADVISOR_ERROR',
      },
      { status: 500 }
    );
  }
}
