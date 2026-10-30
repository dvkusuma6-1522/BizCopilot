'use client';

import React, { useState, useRef } from 'react';
import { InventoryItem } from '@/lib/types';
import { SupportedLanguage } from '@/lib/i18n';
import {
  matchBillLinesToInventory,
  ExtractedBillItem,
} from '@/lib/engine/fast-entry';
import {
  Camera,
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Plus,
  Loader2,
  Trash2,
} from 'lucide-react';

interface BillExtractModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  lang?: SupportedLanguage;
  onRecordStockIn: (
    items: { productId: string; quantity: number; unitCost?: number }[]
  ) => Promise<void>;
  onAddNewProduct?: (product: Partial<InventoryItem>) => Promise<void>;
}

export const BillExtractModal: React.FC<BillExtractModalProps> = ({
  isOpen,
  onClose,
  inventory,
  lang = 'en',
  onRecordStockIn,
  onAddNewProduct,
}) => {
  const [step, setStep] = useState<'capture' | 'review'>('capture');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [supplierName, setSupplierName] = useState<string>('');
  const [billDate, setBillDate] = useState<string>('');
  const [reviewLines, setReviewLines] = useState<
    Array<{
      id: string;
      selected: boolean;
      name: string;
      quantity: number;
      unitPrice: number;
      matchedProductId: string;
      confidence: number;
    }>
  >([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    en: {
      title: 'Scan Supplier Bill',
      subtitle: 'Photo of invoice directly to stock inventory',
      consentNotice: 'Privacy Notice: This photo is sent to Google AI solely to read the bill lines. Your sales data and customer records never leave your device.',
      captureButton: 'Take Photo of Bill',
      uploadButton: 'Choose from Gallery',
      processing: 'Analyzing bill with AI...',
      reviewTitle: 'Review Bill Line Items',
      supplier: 'Supplier',
      date: 'Bill Date',
      addToStock: 'Add Checked Items to Stock',
      newProductNotice: '(New item will be created)',
      manualEntry: 'Add Item Manually',
    },
    kn: {
      title: 'ಸರಬರಾಜುದಾರರ ಬಿಲ್ ಸ್ಕ್ಯಾನ್',
      subtitle: 'ಬಿಲ್ ಫೋಟೋದಿಂದ ನೇರವಾಗಿ ಸ್ಟಾಕ್‌ಗೆ ನಮೂದಿಸಿ',
      consentNotice: 'ಗೌಪ್ಯತೆ ಮಾಹಿತಿ: ಬಿಲ್ ವಿವರಗಳನ್ನು ಓದಲು ಮಾತ್ರ ಈ ಫೋಟೋವನ್ನು ಗೂಗಲ್ ಎಐಗೆ ಕಳುಹಿಸಲಾಗುತ್ತದೆ. ನಿಮ್ಮ ಮಾರಾಟದ ಮಾಹಿತಿ ಸಾಧನದಲ್ಲೇ ಸುರಕ್ಷಿತವಾಗಿರುತ್ತದೆ.',
      captureButton: 'ಬಿಲ್ ಫೋಟೋ ತೆಗೆಯಿರಿ',
      uploadButton: 'ಗ್ಯಾಲರಿಯಿಂದ ಆಯ್ಕೆಮಾಡಿ',
      processing: 'ಎಐ ಮೂಲಕ ಬಿಲ್ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
      reviewTitle: 'ಬಿಲ್ ಸರಕುಗಳ ಪರಿಶೀಲನೆ',
      supplier: 'ಸರಬರಾಜುದಾರರು',
      date: 'ಬಿಲ್ ದಿನಾಂಕ',
      addToStock: 'ಆಯ್ಕೆಮಾಡಿದ ಸರಕುಗಳನ್ನು ಸ್ಟಾಕ್‌ಗೆ ಸೇರಿಸಿ',
      newProductNotice: '(ಹೊಸ ಸರಕಾಗಿ ಸೇರಿಸಲಾಗುತ್ತದೆ)',
      manualEntry: 'ಹಸ್ತಚಾಲಿತವಾಗಿ ಸೇರಿಸಿ',
    },
    hi: {
      title: 'सप्लायर बिल स्कैन करें',
      subtitle: 'बिल की फोटो से सीधे स्टॉक एंट्री करें',
      consentNotice: 'गोपनीयता सूचना: यह फोटो केवल बिल पढ़ने के लिए गूगल एआई को भेजी जाती है। आपका बिक्री डेटा हमेशा आपके फोन में ही रहता है।',
      captureButton: 'बिल की फोटो खींचें',
      uploadButton: 'गैलरी से फोटो चुनें',
      processing: 'एआई बिल का विश्लेषण कर रहा है...',
      reviewTitle: 'बिल में दर्ज सामान की समीक्षा',
      supplier: 'सप्लायर का नाम',
      date: 'बिल दिनांक',
      addToStock: 'चुने हुए सामान को स्टॉक में जोड़ें',
      newProductNotice: '(नया सामान बनेगा)',
      manualEntry: 'हाथ से सामान जोड़ें',
    },
  }[lang] || {
    title: 'Scan Supplier Bill',
    subtitle: 'Photo of invoice directly to stock inventory',
    consentNotice: 'Privacy Notice: This photo is sent to Google AI solely to read the bill lines. Your sales data and customer records never leave your device.',
    captureButton: 'Take Photo of Bill',
    uploadButton: 'Choose from Gallery',
    processing: 'Analyzing bill with AI...',
    reviewTitle: 'Review Bill Line Items',
    supplier: 'Supplier',
    date: 'Bill Date',
    addToStock: 'Add Checked Items to Stock',
    newProductNotice: '(New item will be created)',
    manualEntry: 'Add Item Manually',
  };

  if (!isOpen) return null;

  // Resize image to max 1600px JPEG
  const resizeImageToMax1600 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context unavailable'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', 0.85);
          resolve(base64);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const base64Data = await resizeImageToMax1600(file);

      const res = await fetch('/api/bill-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: 'image/jpeg',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(
          data.error || 'Failed to extract bill items. You can add items manually below.'
        );
        // Fallback to empty review screen so user can still add items manually
        setReviewLines([
          {
            id: `line-${Date.now()}`,
            selected: true,
            name: '',
            quantity: 10,
            unitPrice: 100,
            matchedProductId: 'NEW_PRODUCT',
            confidence: 0,
          },
        ]);
        setStep('review');
        return;
      }

      setSupplierName(data.supplierName || '');
      setBillDate(data.billDate || new Date().toISOString().split('T')[0]);

      // Fuzzy match extracted items to inventory
      const extracted: ExtractedBillItem[] = data.items || [];
      const matched = matchBillLinesToInventory(extracted, inventory);

      setReviewLines(
        matched.map((m, idx) => ({
          id: `line-${idx}-${Date.now()}`,
          selected: true,
          name: m.extracted.name,
          quantity: m.extracted.quantity,
          unitPrice: m.extracted.unitPrice || 0,
          matchedProductId: m.matchedProduct?.productId || 'NEW_PRODUCT',
          confidence: m.confidence,
        }))
      );

      setStep('review');
    } catch (err: unknown) {
      console.error('Error extracting bill:', err);
      setErrorMessage(
        'Could not process image. Please try again or type entries manually.'
      );
      setReviewLines([
        {
          id: `line-${Date.now()}`,
          selected: true,
          name: '',
          quantity: 10,
          unitPrice: 100,
          matchedProductId: 'NEW_PRODUCT',
          confidence: 0,
        },
      ]);
      setStep('review');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddManualLine = () => {
    setReviewLines((prev) => [
      ...prev,
      {
        id: `line-${Date.now()}`,
        selected: true,
        name: '',
        quantity: 10,
        unitPrice: 100,
        matchedProductId: 'NEW_PRODUCT',
        confidence: 0,
      },
    ]);
  };

  const handleRemoveLine = (id: string) => {
    setReviewLines((prev) => prev.filter((l) => l.id !== id));
  };

  const handleCommitStock = async () => {
    const selectedLines = reviewLines.filter((l) => l.selected && l.quantity > 0);
    if (selectedLines.length === 0 || isProcessing) return;

    setIsProcessing(true);
    try {
      const stockInItems: { productId: string; quantity: number; unitCost?: number }[] = [];

      for (const line of selectedLines) {
        if (line.matchedProductId === 'NEW_PRODUCT' || !line.matchedProductId) {
          // Create new product if handler provided
          const newId = `P-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 900 + 100)}`;
          if (onAddNewProduct) {
            await onAddNewProduct({
              productId: newId,
              productName: line.name.trim() || 'New Stock Item',
              category: 'General',
              stockOnHand: line.quantity,
              unitCost: line.unitPrice,
              retailPrice: Math.round(line.unitPrice * 1.25),
              reorderLevel: 5,
              supplierLeadDays: 3,
            });
          }
        } else {
          stockInItems.push({
            productId: line.matchedProductId,
            quantity: line.quantity,
            unitCost: line.unitPrice > 0 ? line.unitPrice : undefined,
          });
        }
      }

      if (stockInItems.length > 0) {
        await onRecordStockIn(stockInItems);
      }

      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg mx-auto bg-white rounded-t-3xl max-h-[92vh] flex flex-col shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom-10">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              🧾
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.title}</h3>
              <p className="text-xs text-slate-500">{t.subtitle}</p>
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

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {step === 'capture' && (
            <div className="space-y-4">
              {/* Privacy Consent Notice */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{t.consentNotice}</p>
              </div>

              {/* Upload & Camera Buttons */}
              <div className="py-6 flex flex-col gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="w-full min-h-[64px] rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-rose-900/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6" />
                  )}
                  <span>{isProcessing ? t.processing : t.captureButton}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture');
                      fileInputRef.current.click();
                    }
                  }}
                  disabled={isProcessing}
                  className="w-full min-h-[52px] rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <Upload className="h-4 w-4 text-slate-500" />
                  <span>{t.uploadButton}</span>
                </button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-4 animate-in fade-in">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Supplier & Date Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    {t.supplier}
                  </label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="Distributor Name"
                    className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 outline-hidden font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    {t.date}
                  </label>
                  <input
                    type="date"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 outline-hidden font-semibold"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{t.reviewTitle} ({reviewLines.length})</span>
                  <button
                    type="button"
                    onClick={handleAddManualLine}
                    className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-bold text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{t.manualEntry}</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {reviewLines.map((line) => {
                    return (
                      <div
                        key={line.id}
                        className={`p-3 rounded-xl border transition-all ${
                          line.selected
                            ? 'border-emerald-300 bg-emerald-50/40'
                            : 'border-slate-200 bg-slate-50/40 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={line.selected}
                            onChange={(e) =>
                              setReviewLines((prev) =>
                                prev.map((l) =>
                                  l.id === line.id
                                    ? { ...l, selected: e.target.checked }
                                    : l
                                )
                              )
                            }
                            className="mt-1 h-5 w-5 rounded-md text-emerald-600 focus:ring-emerald-500"
                          />

                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={line.name}
                              onChange={(e) =>
                                setReviewLines((prev) =>
                                  prev.map((l) =>
                                    l.id === line.id
                                      ? { ...l, name: e.target.value }
                                      : l
                                  )
                                )
                              }
                              placeholder="Item Name"
                              className="w-full min-h-[40px] px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 outline-hidden"
                            />

                            {/* Matching Dropdown */}
                            <select
                              value={line.matchedProductId}
                              onChange={(e) =>
                                setReviewLines((prev) =>
                                  prev.map((l) =>
                                    l.id === line.id
                                      ? { ...l, matchedProductId: e.target.value }
                                      : l
                                  )
                                )
                              }
                              className="w-full min-h-[40px] px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 outline-hidden"
                            >
                              <option value="NEW_PRODUCT">
                                + Create as New Product
                              </option>
                              {inventory.map((p) => (
                                <option key={p.productId} value={p.productId}>
                                  Match: {p.productName} (Cur: {p.stockOnHand})
                                </option>
                              ))}
                            </select>

                            {/* Quantity & Unit Cost */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-500 block">
                                  Qty to Inward
                                </label>
                                <input
                                  type="number"
                                  value={line.quantity}
                                  onChange={(e) =>
                                    setReviewLines((prev) =>
                                      prev.map((l) =>
                                        l.id === line.id
                                          ? {
                                              ...l,
                                              quantity: parseInt(e.target.value, 10) || 0,
                                            }
                                          : l
                                      )
                                    )
                                  }
                                  className="w-full min-h-[38px] px-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-500 block">
                                  Cost / Unit (₹)
                                </label>
                                <input
                                  type="number"
                                  value={line.unitPrice}
                                  onChange={(e) =>
                                    setReviewLines((prev) =>
                                      prev.map((l) =>
                                        l.id === line.id
                                          ? {
                                              ...l,
                                              unitPrice: parseFloat(e.target.value) || 0,
                                            }
                                          : l
                                      )
                                    )
                                  }
                                  className="w-full min-h-[38px] px-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900"
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveLine(line.id)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Thumb Zone Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCommitStock}
                  disabled={isProcessing || reviewLines.filter((l) => l.selected).length === 0}
                  className="w-full min-h-[56px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{isProcessing ? 'Updating Stock...' : t.addToStock}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
