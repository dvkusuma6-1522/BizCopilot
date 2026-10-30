'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  PeriodSummary,
  CalculatedInventoryItem,
  ProductPerformance,
  DailySalesTrend,
} from '@/lib/types';
import { SupportedLanguage } from '@/lib/i18n';
import { CategoryConfig } from '@/lib/categories/types';
import { Festival } from '@/lib/festivals/data';
import {
  Bot,
  User,
  Send,
  Sparkles,
  Clock,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export interface AdvisorChatProps {
  summary: PeriodSummary;
  inventory: CalculatedInventoryItem[];
  productPerformance: ProductPerformance[];
  salesTrend?: DailySalesTrend[];
  lang?: SupportedLanguage;
  category?: CategoryConfig;
  storeName?: string;
  festivals?: Festival[];
  aiAvailable?: boolean;
}

interface ChatItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
}

export const AdvisorChat: React.FC<AdvisorChatProps> = ({
  summary,
  inventory,
  productPerformance,
  salesTrend = [],
  lang = 'en',
  category,
  storeName = 'My Shop',
  festivals = [],
  aiAvailable = true,
}) => {
  const [messages, setMessages] = useState<ChatItem[]>(() => {
    const welcomeText =
      lang === 'kn'
        ? `ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ **BizCopilot AI ವ್ಯಾಪಾರ ಸಲಹೆಗಾರ** (${category ? category.labels.kn : 'ಅಂಗಡಿ'}).\n\nನಿಮ್ಮ ದಿನನಿತ್ಯದ ಮಾರಾಟ, ದಾಸ್ತಾನು ಕೊರತೆಯ ಅಪಾಯಗಳು ಮತ್ತು ಮುಂದಿನ ಹಬ್ಬದ ತಯಾರಿ ಬಗ್ಗೆ ನೇರವಾಗಿ ಸಲಹೆ ನೀಡುತ್ತೇನೆ. ಯಾವುದೇ ಕೃತಕ ಸಂಖ್ಯೆಗಳಿಲ್ಲ—ಎಲ್ಲವೂ ನಿಮ್ಮ ಅಂಗಡಿಯ ನಿಜವಾದ ಲೆಕ್ಕ.\n\nಕೆಳಗಿನ ಪ್ರಶ್ನೆಗಳನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ.`
        : lang === 'hi'
        ? `नमस्ते! मैं आपका **BizCopilot AI व्यापार सलाहकार** हूं (${category ? category.labels.hi : 'दुकान'})।\n\nमैं आपकी दुकान की दैनिक बिक्री, स्टॉक खत्म होने के खतरे और आगामी त्योहारों की तैयारी के लिए सुझाव देता हूं। कोई काल्पनिक आंकड़े नहीं—सब कुछ आपकी दुकान की वास्तविक बिक्री पर आधारित है।\n\nनीचे दिए गए सुझावों पर क्लिक करें या अपना सवाल पूछें।`
        : `Hello! I am your **BizCopilot AI Advisor** for ${storeName} (${category ? category.labels.en : 'Store'}).\n\nI monitor your sales velocity shifts, stockout threats, and upcoming festival peaks in real time. FACTS FIRST: Every recommendation is grounded strictly in your store numbers.\n\nAsk me anything below or tap one of the suggested prompts to get live advice.`;

    return [
      {
        id: 'welcome',
        sender: 'assistant',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const speakText = (text: string) => {
    if (!speechEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang === 'kn' ? 'kn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  };

  const samplePrompts = {
    en: [
      'What should I reorder today?',
      'Which items sold best this week?',
      'Any festival stock to prepare?',
      'Which products have cash locked up?',
    ],
    kn: [
      'ಇಂದೇ ನಾನು ಯಾವ ವಸ್ತುಗಳನ್ನು ರೀಆರ್ಡರ್ ಮಾಡಬೇಕು?',
      'ಈ ವಾರ ಹೆಚ್ಚು ಮಾರಾಟವಾದ ವಸ್ತುಗಳು ಯಾವುವು?',
      'ಮುಂದಿನ ಹಬ್ಬಕ್ಕೆ ಯಾವ ದಾಸ್ತಾನು ಸಿದ್ಧತೆ ಮಾಡಬೇಕು?',
      'ಯಾವ ವಸ್ತುಗಳಲ್ಲಿ ಹಣ ಸಿಲುಕಿಕೊಂಡಿದೆ?',
    ],
    hi: [
      'आज मुझे कौन सा सामान रीऑर्डर करना चाहिए?',
      'इस हफ्ते सबसे ज्यादा क्या बिका?',
      'आने वाले त्योहार के लिए कौन सा स्टॉक मंगाना है?',
      'किन उत्पादों में पैसा फंसा हुआ है?',
    ],
  }[lang] || [
    'What should I reorder today?',
    'Which items sold best this week?',
    'Any festival stock to prepare?',
    'Which products have cash locked up?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    const assistantMsgId = `assistant-${Date.now()}`;
    const initialAssistantMsg: ChatItem = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, initialAssistantMsg]);

    try {
      // Prepare compact metrics summary from Dexie client state (NO raw transactions)
      const topSellers = productPerformance.slice(0, 5).map((p) => ({
        name: p.productName,
        unitsSold: p.unitsSold,
        revenue: p.revenue,
      }));

      const lowStock = inventory
        .filter((i) => i.isStockoutRisk)
        .slice(0, 5)
        .map((i) => ({
          name: i.productName,
          daysOfStockLeft: Math.round(i.daysOfCover),
          supplierLeadDays: i.supplierLeadDays,
          recommendedReorder: i.recommendedReorderQty,
          stockOnHand: i.stockOnHand,
        }));

      const weeklySalesTrend = salesTrend.slice(-7).map((t) => ({
        date: t.displayDate || t.date,
        revenue: t.revenue,
        units: t.units,
      }));

      const today = new Date();
      const upcomingFestivals = festivals
        .map((f) => {
          const dateStr = f.date || f.dateRange?.start;
          if (!dateStr) return null;
          const fDate = new Date(dateStr);
          const diffDays = Math.ceil((fDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return {
            name: f.name[lang] || f.name.en,
            daysAway: diffDays,
            tip: f.tip[lang] || f.tip.en,
          };
        })
        .filter((f): f is { name: string; daysAway: number; tip: string } => f !== null && f.daysAway >= 0 && f.daysAway <= 45)
        .slice(0, 3);

      const deadStock = inventory
        .filter((i) => i.isDeadStock)
        .slice(0, 3)
        .map((i) => ({
          name: i.productName,
          stockOnHand: i.stockOnHand,
          lockedCost: i.deadStockValue,
        }));

      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          language: lang,
          stream: true,
          metrics: {
            storeName,
            categoryName: category?.labels[lang] || category?.labels.en,
            topSellers,
            lowStock,
            weeklySalesTrend,
            upcomingFestivals,
            deadStock,
            totalRevenue: summary.totalRevenue,
            revenueChangePct: summary.revenueChangePct,
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg =
          errJson.error ||
          (lang === 'kn'
            ? 'ಸಲಹೆ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
            : lang === 'hi'
            ? 'सलाह लोड करने में समस्या हुई। कृपया पुनः प्रयास करें।'
            : 'Could not fetch advisor response. Please try again.');

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, text: errMsg, isStreaming: false }
              : m
          )
        );
        setIsLoading(false);
        return;
      }

      if (!res.body) {
        throw new Error('No streaming response body available');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, text: fullText } : m
          )
        );
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, isStreaming: false } : m
        )
      );
      speakText(fullText);
    } catch (e: unknown) {
      console.warn('Advisor stream error:', e);
      const fallbackMsg =
        lang === 'kn'
          ? 'ಸಂಪರ್ಕ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ.'
          : lang === 'hi'
          ? 'कनेक्शन में समस्या हुई। कृपया इंटरनेट जांचें।'
          : 'Connection error while communicating with AI advisor.';

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, text: fallbackMsg, isStreaming: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text:
          lang === 'kn'
            ? 'ಸಂಭಾಷಣೆಯನ್ನು ಮರುಹೊಂದಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ.'
            : lang === 'hi'
            ? 'बातचीत रीसेट हो गई है। आप क्या पूछना चाहते हैं?'
            : 'Conversation reset. How can I advise your shop today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[550px] rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-900/10">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">
                {lang === 'kn'
                  ? 'AI ವ್ಯಾಪಾರ ಸಲಹೆಗಾರ'
                  : lang === 'hi'
                  ? 'AI व्यापार सलाहकार'
                  : 'Gemini AI Advisor'}
              </h2>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  aiAvailable
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {aiAvailable
                  ? 'Gemini 2.5 Flash'
                  : lang === 'kn'
                  ? 'ನಿಯಮ-ಆಧಾರಿತ ಮೋಡ್'
                  : lang === 'hi'
                  ? 'नियम-आधारित मोड'
                  : 'Rule-Based Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>
                {aiAvailable
                  ? lang === 'kn'
                    ? 'ನಿಜವಾದ ಅಂಗಡಿ ಲೆಕ್ಕಾಚಾರಗಳು • ಲೈವ್ ಸ್ಟ್ರೀಮಿಂಗ್'
                    : lang === 'hi'
                    ? 'सटीक दुकान गणना • लाइव स्ट्रीमिंग'
                    : 'Deterministic facts only • Live streaming'
                  : lang === 'kn'
                  ? 'ಸ್ಮಾರ್ಟ್ ಎಐ ಸಕ್ರಿಯವಾಗಿಲ್ಲ. ನಿಯಮ-ಆಧಾರಿತ ಮೋಡ್‌ನಲ್ಲಿದೆ.'
                  : lang === 'hi'
                  ? 'स्मार्ट एआई अभी सक्रिय नहीं है। नियम-आधारित मोड।'
                  : 'Smart AI answers are not enabled yet. Operating in rule-based mode.'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`min-h-[48px] min-w-[48px] rounded-xl border flex items-center justify-center transition-all ${
              speechEnabled
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 text-slate-400 hover:text-slate-700'
            }`}
            title={speechEnabled ? 'Mute voice readout' : 'Enable voice readout'}
            aria-label="Voice readout"
          >
            {speechEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>

          <button
            onClick={handleClearHistory}
            className="min-h-[48px] px-3 rounded-xl border border-slate-200 flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
            title="Clear history"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">
              {lang === 'kn' ? 'ತೆರವುಗೊಳಿಸಿ' : lang === 'hi' ? 'रीसेट' : 'Clear'}
            </span>
          </button>
        </div>
      </div>

      {/* Suggested Chips Bar */}
      <div className="border-b border-slate-100 bg-slate-50/80 px-3 py-2 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="shrink-0 text-slate-400 font-bold flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>{lang === 'kn' ? 'ಪ್ರಶ್ನೆಗಳು:' : lang === 'hi' ? 'सुझाव:' : 'Prompts:'}</span>
          </span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              disabled={isLoading}
              className="shrink-0 min-h-[48px] rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/80 hover:text-emerald-900 transition-all shadow-2xs active:scale-95 disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-2xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-xs ${
                msg.sender === 'user' ? 'bg-slate-800' : 'bg-emerald-600'
              }`}
            >
              {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-5 w-5" />}
            </div>

            <div className="space-y-1">
              <div
                className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line font-normal">
                  {msg.text || (msg.isStreaming ? (
                    <span className="flex items-center gap-2 text-slate-400 italic">
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                      {lang === 'kn' ? 'ಸಲಹೆ ರಚಿಸಲಾಗುತ್ತಿದೆ...' : lang === 'hi' ? 'सलाह तैयार हो रही है...' : 'Generating advice...'}
                    </span>
                  ) : '')}
                </div>
              </div>

              <div
                className={`flex items-center gap-1 text-[10px] text-slate-400 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <Clock className="h-2.5 w-2.5" />
                <span>{msg.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Zone with Large Touch Targets */}
      <div className="border-t border-slate-200/90 bg-white p-3 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={
              lang === 'kn'
                ? 'ಅಂಗಡಿ ಮಾರಾಟ ಅಥವಾ ದಾಸ್ತಾನು ಬಗ್ಗೆ ಕೇಳಿ...'
                : lang === 'hi'
                ? 'दुकान की बिक्री या स्टॉक के बारे में पूछें...'
                : 'Ask Gemini about reorders, sales trends, or festivals...'
            }
            className="flex-1 min-h-[48px] rounded-xl border border-slate-200 px-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden font-medium"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="min-h-[48px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-900/10 transition-all disabled:opacity-40"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline">
                  {lang === 'kn' ? 'ಕೇಳಿ' : lang === 'hi' ? 'पूछें' : 'Send'}
                </span>
                <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-2 text-center text-[10px] text-slate-400">
          FACTS FIRST: Pure code calculations • Zero raw transactions leave device • Google Gemini 2.5 Flash
        </div>
      </div>
    </div>
  );
};
