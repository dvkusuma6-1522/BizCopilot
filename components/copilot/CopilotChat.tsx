'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ChatMessage,
  PeriodSummary,
  CalculatedInventoryItem,
  ProductPerformance,
} from '@/lib/types';
import { generateCopilotResponse } from '@/lib/copilot-engine';
import {
  Bot,
  User,
  Send,
  Sparkles,
  Clock,
  RotateCcw,
} from 'lucide-react';

interface CopilotChatProps {
  summary: PeriodSummary;
  inventory: CalculatedInventoryItem[];
  productPerformance: ProductPerformance[];
}

export const CopilotChat: React.FC<CopilotChatProps> = ({
  summary,
  inventory,
  productPerformance,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your **BizCopilot Intelligence Advisor** for FreshMart Grocery.\n\nI monitor your daily store revenue, velocity shifts, stockout threats, and dead stock exposure in real time.\n\nAsk me questions below or click one of the suggested prompts to see live answers calculated from your active store dataset.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: [
        'Which products should I reorder first?',
        'Why did my sales drop this week?',
        'Which products are tying up my cash?',
        'What are my top-selling products?',
        'Give me the top three actions I should take today.',
      ],
      dataBadges: [
        { label: 'Active SKUs', value: `${inventory.length}`, color: 'emerald' },
        { label: 'Stockout Risks', value: `${summary.stockoutRiskCount}`, color: summary.stockoutRiskCount > 0 ? 'red' : 'emerald' },
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Simulate subtle conversational delay
    setTimeout(() => {
      const response = generateCopilotResponse(query, {
        summary,
        inventory,
        productPerformance,
      });

      const assistantMsg: ChatMessage = {
        ...response,
        id: `assistant-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'Conversation reset. How can I assist your business analysis today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: [
          'Which products should I reorder first?',
          'Why did my sales drop this week?',
          'Which products are tying up my cash?',
          'What are my top-selling products?',
        ],
      },
    ]);
  };

  const samplePrompts = [
    'Why did my sales drop this week?',
    'Which products should I reorder first?',
    'Which products are tying up my cash?',
    'What are my top-selling products?',
    'Give me the top three actions I should take today.',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[550px] rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Ask BizCopilot</h2>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Deterministic Advisor
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Instant answers grounded in your live sales and inventory dataset
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          title="Reset conversation"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Clear</span>
        </button>
      </div>

      {/* Suggested Prompt Chips Bar */}
      <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="shrink-0 text-slate-400 font-medium flex items-center gap-1 mr-1">
            <Sparkles className="h-3 w-3 text-emerald-600" /> Prompts:
          </span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 transition-all shadow-2xs"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-xs ${
                msg.sender === 'user' ? 'bg-slate-800' : 'bg-emerald-600'
              }`}
            >
              {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            {/* Bubble */}
            <div className="space-y-2">
              <div
                className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line font-normal">{msg.text}</div>

                {/* Data Badges if available */}
                {msg.dataBadges && msg.dataBadges.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                    {msg.dataBadges.map((badge, bIdx) => (
                      <span
                        key={bIdx}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          badge.color === 'red'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : badge.color === 'amber'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : badge.color === 'blue'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        <span className="text-slate-500 font-normal">{badge.label}:</span>
                        <span>{badge.value}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div
                className={`flex items-center gap-1 text-[10px] text-slate-400 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <Clock className="h-2.5 w-2.5" />
                <span>{msg.timestamp}</span>
              </div>

              {/* Follow-up Prompts for assistant responses */}
              {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {msg.suggestedFollowUps.map((fu, fIdx) => (
                    <button
                      key={fIdx}
                      onClick={() => handleSendMessage(fu)}
                      className="rounded-lg border border-slate-200/80 bg-white/90 px-2.5 py-1 text-[11px] font-medium text-emerald-800 hover:border-emerald-300 hover:bg-emerald-50 transition-all shadow-2xs"
                    >
                      ↳ {fu}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 max-w-md mr-auto">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-white border border-slate-200/90 px-4 py-3 shadow-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" />
                <span
                  className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-slate-200/90 bg-white p-4">
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
            onKeyDown={handleKeyDown}
            placeholder="Ask BizCopilot about your sales drops, stockouts, or reorders..."
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-40 transition-all"
          >
            <span>Send</span>
            <Send className="h-4 w-4" />
          </button>
        </form>
        <div className="mt-2 text-center text-[11px] text-slate-400">
          Rule-based intelligence MVP • Runs 100% locally in your browser • No API keys required
        </div>
      </div>
    </div>
  );
};
