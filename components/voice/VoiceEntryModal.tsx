'use client';

import React, { useState, useEffect, useRef } from 'react';
import { InventoryItem } from '@/lib/types';
import { SupportedLanguage } from '@/lib/i18n';
import {
  parseVoiceIntent,
  fuzzyMatchProduct,
  ParsedVoiceResult,
  MatchedCandidate,
} from '@/lib/voice/parse';
import {
  Mic,
  MicOff,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { formatINR } from '@/lib/analytics';

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: SpeechRecognitionResultItem;
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface VoiceEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  lang?: SupportedLanguage;
  onRecordSale: (lines: { productId: string; quantity: number }[]) => Promise<void>;
  onRecordStockIn: (items: { productId: string; quantity: number }[]) => Promise<void>;
}

export const VoiceEntryModal: React.FC<VoiceEntryModalProps> = ({
  isOpen,
  onClose,
  inventory,
  lang = 'en',
  onRecordSale,
  onRecordStockIn,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parseResult, setParseResult] = useState<ParsedVoiceResult | null>(null);
  const [candidates, setCandidates] = useState<MatchedCandidate[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Map app lang to Web Speech BCP 47 tag
  const speechLang =
    lang === 'kn' ? 'kn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';

  const t = {
    en: {
      title: 'Voice Assistant',
      listening: 'Listening... Speak now',
      tapToSpeak: 'Tap microphone to speak',
      examples: 'Try: "sold 3 oil" • "added 10 basmati rice" • "5 parle-g sold"',
      intentSale: 'Sale',
      intentStock: 'Stock Received',
      confirmSave: 'Confirm & Save',
      tryAgain: 'Try Again',
      selectProduct: 'Select matching product:',
      understood: 'Understood:',
      units: 'units',
      notSupported: 'Voice recognition not supported in this browser. Try manual entry.',
    },
    kn: {
      title: 'ಧ್ವನಿ ಮೂಲಕ ನಮೂದು (Voice Assistant)',
      listening: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ... ಈಗ ಮಾತನಾಡಿ',
      tapToSpeak: 'ಮಾತನಾಡಲು ಮೈಕ್ರೊಫೋನ್ ಟ್ಯಾಪ್ ಮಾಡಿ',
      examples: 'ಉದಾ: "ಮೂರು ಆಯಿಲ್ ಮಾರಾಟ" • "ಹತ್ತು ಕಿಲೋ ಅಕ್ಕಿ ಬಂತು" • "5 ಪಾರ್ಲೆ ಜಿ ಮಾರಾಟ"',
      intentSale: 'ಮಾರಾಟ (Sale)',
      intentStock: 'ದಾಸ್ತಾನು ಬಂತು (Stock In)',
      confirmSave: 'ಖಚಿತಪಡಿಸಿ ಉಳಿಸಿ (Confirm)',
      tryAgain: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
      selectProduct: 'ಹೊಂದಿಕೆಯಾಗುವ ಸರಕನ್ನು ಆಯ್ಕೆಮಾಡಿ:',
      understood: 'ತಿಳಿದುಕೊಂಡ ಮಾಹಿತಿ:',
      units: 'ಯೂನಿಟ್‌ಗಳು',
      notSupported: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಸೌಲಭ್ಯ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.',
    },
    hi: {
      title: 'बोलकर दर्ज करें (Voice Assistant)',
      listening: 'सुन रहे हैं... अब बोलें',
      tapToSpeak: 'बोलने के लिए माइक दबाएं',
      examples: 'उदा: "5 तेल बेचा" • "20 पार्ले जी आए" • "तीन दही बिके"',
      intentSale: 'बिक्री (Sale)',
      intentStock: 'माल आया (Stock In)',
      confirmSave: 'पुष्टि करें और सहेजें',
      tryAgain: 'दोबारा बोलें',
      selectProduct: 'सही सामान चुनें:',
      understood: 'समझा गया विवरण:',
      units: 'यूनिट',
      notSupported: 'इस ब्राउज़र में वॉइस रिकग्निशन उपलब्ध नहीं है।',
    },
  }[lang] || {
    title: 'Voice Assistant',
    listening: 'Listening... Speak now',
    tapToSpeak: 'Tap microphone to speak',
    examples: 'Try: "sold 3 oil" • "added 10 basmati rice" • "5 parle-g sold"',
    intentSale: 'Sale',
    intentStock: 'Stock Received',
    confirmSave: 'Confirm & Save',
    tryAgain: 'Try Again',
    selectProduct: 'Select matching product:',
    understood: 'Understood:',
    units: 'units',
    notSupported: 'Voice recognition not supported in this browser.',
  };

  const startListening = () => {
    setErrorMsg(null);
    setTranscript('');
    setParseResult(null);
    setCandidates([]);
    setSelectedProduct(null);

    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRecognitionClass =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setErrorMsg(t.notSupported);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = speechLang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const spoken = event.results?.[0]?.[0]?.transcript || '';
        if (spoken) {
          handleTranscript(spoken);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access denied. Please allow microphone permission in your browser.');
        } else {
          setErrorMsg(`Could not hear clearly (${event.error}). Please tap and try again.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: unknown) {
      console.error('Failed to start speech recognition:', e);
      setIsListening(false);
      setErrorMsg('Could not initialize speech recognition.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  // Process transcript deterministically
  const handleTranscript = (text: string) => {
    setTranscript(text);
    const parsed = parseVoiceIntent(text, lang as 'en' | 'kn' | 'hi');
    setParseResult(parsed);

    if (parsed.productQuery) {
      const matches = fuzzyMatchProduct(parsed.productQuery, inventory);
      setCandidates(matches);
      if (matches.length > 0) {
        setSelectedProduct(matches[0].product);
      }
    }
  };

  const handleConfirmSave = async () => {
    if (!parseResult || !selectedProduct || isSaving) return;
    setIsSaving(true);
    try {
      if (parseResult.intent === 'sale') {
        await onRecordSale([
          {
            productId: selectedProduct.productId,
            quantity: parseResult.quantity,
          },
        ]);
      } else {
        await onRecordStockIn([
          {
            productId: selectedProduct.productId,
            quantity: parseResult.quantity,
          },
        ]);
      }
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript('');
      setParseResult(null);
      setCandidates([]);
      setSelectedProduct(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg mx-auto bg-white rounded-t-3xl p-5 shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              🎙️
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.title}</h3>
              <p className="text-xs text-slate-500">
                Language: <span className="font-semibold">{speechLang}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 active:scale-95 transition-all"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Big Mic Button & Animation */}
        <div className="py-6 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            {isListening && (
              <span className="absolute -inset-4 rounded-full bg-amber-400/30 animate-ping pointer-events-none" />
            )}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`h-24 w-24 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all ${
                isListening
                  ? 'bg-red-500 text-white shadow-red-500/40'
                  : 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-amber-500/30'
              }`}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? (
                <MicOff className="h-10 w-10 animate-pulse" />
              ) : (
                <Mic className="h-10 w-10" />
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm font-bold text-slate-800">
              {isListening ? t.listening : t.tapToSpeak}
            </p>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              {t.examples}
            </p>
          </div>
        </div>

        {/* Error message if any */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Parsed Result Confirmation Card */}
        {parseResult && (
          <div className="p-4 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/50 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t.understood}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${
                  parseResult.intent === 'sale'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {parseResult.intent === 'sale' ? (
                  <TrendingDown className="h-3.5 w-3.5" />
                ) : (
                  <TrendingUp className="h-3.5 w-3.5" />
                )}
                {parseResult.intent === 'sale' ? t.intentSale : t.intentStock}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-emerald-200">
              <div className="text-xs text-slate-400 italic mb-1">
                &ldquo;{transcript}&rdquo;
              </div>
              <div className="text-base font-extrabold text-slate-900 flex items-center justify-between">
                <span>{selectedProduct ? selectedProduct.productName : parseResult.productQuery}</span>
                <span className="text-emerald-700">
                  {parseResult.quantity} {t.units}
                </span>
              </div>
              {selectedProduct && parseResult.intent === 'sale' && (
                <div className="text-xs text-slate-500 mt-1">
                  Total:{' '}
                  <strong className="text-slate-800">
                    {formatINR(selectedProduct.retailPrice * parseResult.quantity)}
                  </strong>{' '}
                  ({formatINR(selectedProduct.retailPrice)} each)
                </div>
              )}
            </div>

            {/* Top 3 Candidate Chips if multiple items match */}
            {candidates.length > 1 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-600">
                  {t.selectProduct}
                </span>
                <div className="flex flex-col gap-1.5">
                  {candidates.map((c) => {
                    const isSelected = selectedProduct?.productId === c.product.productId;
                    return (
                      <button
                        key={c.product.productId}
                        type="button"
                        onClick={() => setSelectedProduct(c.product)}
                        className={`min-h-[48px] p-2.5 rounded-xl border text-left flex items-center justify-between active:scale-98 transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-100/60 font-bold text-emerald-950'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-xs truncate block">{c.product.productName}</span>
                          <span className="text-[10px] text-slate-400">Stock: {c.product.stockOnHand}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons in thumb zone */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={startListening}
                className="min-h-[48px] px-3.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold active:scale-95 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="h-4 w-4" />
                <span>{t.tryAgain}</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={!selectedProduct || isSaving}
                className="flex-1 min-h-[52px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>{isSaving ? 'Saving...' : t.confirmSave}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
