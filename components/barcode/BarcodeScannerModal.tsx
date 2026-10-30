'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InventoryItem } from '@/lib/types';
import { SupportedLanguage } from '@/lib/i18n';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Plus,
  TrendingDown,
  PackagePlus,
  RefreshCw,
} from 'lucide-react';
import { formatINR } from '@/lib/analytics';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  lang?: SupportedLanguage;
  onRecordSale: (lines: { productId: string; quantity: number }[]) => Promise<void>;
  onRecordStockIn: (items: { productId: string; quantity: number }[]) => Promise<void>;
  onAddNewProduct?: (product: Partial<InventoryItem>) => Promise<void>;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  inventory,
  lang = 'en',
  onRecordSale,
  onRecordStockIn,
  onAddNewProduct,
}) => {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [matchedProduct, setMatchedProduct] = useState<InventoryItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // New product form fields if barcode is unknown
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory] = useState('Groceries');
  const [newProductPrice, setNewProductPrice] = useState('50');
  const [newProductStock, setNewProductStock] = useState('10');

  const scannerInstanceRef = useRef<{ stop: () => Promise<void> } | null>(null);

  const t = {
    en: {
      title: 'Barcode Scanner',
      scanHint: 'Point camera at product barcode (EAN-13, UPC)',
      manualHint: 'Or enter barcode number manually:',
      submitCode: 'Search',
      productFound: 'Product Found',
      sellOne: 'Sell 1 Unit',
      addStock: 'Add 10 Units Stock',
      unknownProduct: 'New Barcode Scanned',
      unknownDesc: 'This barcode is not yet in your inventory. Add it now:',
      productName: 'Product Name',
      retailPrice: 'Retail Price (₹)',
      stockOnHand: 'Initial Stock',
      saveNewProduct: 'Save New Product',
      scanNext: 'Scan Next Item',
      permissionDenied: 'Camera access was denied. Please allow camera access in browser settings.',
    },
    kn: {
      title: 'ಬಾರ್‌ಕೋಡ್ ಸ್ಕ್ಯಾನರ್',
      scanHint: 'ಉತ್ಪನ್ನದ ಬಾರ್‌ಕೋಡ್ ಕಡೆಗೆ ಕ್ಯಾಮೆರಾ ಹಿಡಿಯಿರಿ',
      manualHint: 'ಅಥವಾ ಬಾರ್‌ಕೋಡ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ:',
      submitCode: 'ಹುಡುಕಿ',
      productFound: 'ಉತ್ಪನ್ನ ಪತ್ತೆಯಾಗಿದೆ',
      sellOne: '1 ಯೂನಿಟ್ ಮಾರಾಟ',
      addStock: '+10 ದಾಸ್ತಾನು ಸೇರಿಸಿ',
      unknownProduct: 'ಹೊಸ ಬಾರ್‌ಕೋಡ್ ಪತ್ತೆಯಾಗಿದೆ',
      unknownDesc: 'ಈ ಬಾರ್‌ಕೋಡ್ ನಿಮ್ಮ ದಾಸ್ತಾನಿನಲ್ಲಿಲ್ಲ. ಈಗಲೇ ಸೇರಿಸಿ:',
      productName: 'ಉತ್ಪನ್ನದ ಹೆಸರು',
      retailPrice: 'ಮಾರಾಟ ಬೆಲೆ (₹)',
      stockOnHand: 'ಆರಂಭಿಕ ದಾಸ್ತಾನು',
      saveNewProduct: 'ಹೊಸ ಸರಕು ಉಳಿಸಿ',
      scanNext: 'ಮುಂದಿನ ಸರಕು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
      permissionDenied: 'ಕ್ಯಾಮೆರಾ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಅನುಮತಿ ನೀಡಿ.',
    },
    hi: {
      title: 'बारकोड स्कैनर',
      scanHint: 'सामान के बारकोड पर कैमरा फोकस करें',
      manualHint: 'या बारकोड नंबर हाथ से लिखें:',
      submitCode: 'खोजें',
      productFound: 'उत्पाद मिल गया',
      sellOne: '1 यूनिट बेचें',
      addStock: '+10 स्टॉक जोड़ें',
      unknownProduct: 'नया बारकोड मिला',
      unknownDesc: 'यह बारकोड इन्वेंट्री में नहीं है। इसे अभी जोड़ें:',
      productName: 'सामान का नाम',
      retailPrice: 'बिक्री मूल्य (₹)',
      stockOnHand: 'आरंभिक स्टॉक',
      saveNewProduct: 'नया सामान सहेजें',
      scanNext: 'अगला आइटम स्कैन करें',
      permissionDenied: 'कैमरा अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में अनुमति दें।',
    },
  }[lang] || {
    title: 'Barcode Scanner',
    scanHint: 'Point camera at product barcode (EAN-13, UPC)',
    manualHint: 'Or enter barcode number manually:',
    submitCode: 'Search',
    productFound: 'Product Found',
    sellOne: 'Sell 1 Unit',
    addStock: 'Add 10 Units Stock',
    unknownProduct: 'New Barcode Scanned',
    unknownDesc: 'This barcode is not yet in your inventory. Add it now:',
    productName: 'Product Name',
    retailPrice: 'Retail Price (₹)',
    stockOnHand: 'Initial Stock',
    saveNewProduct: 'Save New Product',
    scanNext: 'Scan Next Item',
    permissionDenied: 'Camera access was denied.',
  };

  // Stop scanner safely
  const stopScanner = useCallback(async () => {
    if (scannerInstanceRef.current) {
      try {
        await scannerInstanceRef.current.stop();
      } catch {
        // ignore already stopped
      }
      scannerInstanceRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const handleBarcodeFound = useCallback((code: string) => {
    const clean = code.trim();
    if (!clean) return;

    setScannedCode(clean);
    stopScanner();

    // Look up in inventory
    const found = inventory.find((p) => p.barcode === clean);
    if (found) {
      setMatchedProduct(found);
    } else {
      setMatchedProduct(null);
      setNewProductName('');
    }
  }, [inventory, stopScanner]);

  // Start html5-qrcode scanner
  const startScanner = useCallback(async () => {
    setCameraError(null);
    setScannedCode(null);
    setMatchedProduct(null);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('barcode-scanner-view');
      scannerInstanceRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 160 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleBarcodeFound(decodedText);
        },
        () => {
          // scanning frame (ignore frame parse errors)
        }
      );
      setIsScanning(true);
    } catch (err: unknown) {
      console.warn('Barcode camera scanner error:', err);
      setIsScanning(false);
      setCameraError(t.permissionDenied);
    }
  }, [handleBarcodeFound, t.permissionDenied]);

  useEffect(() => {
    if (isOpen) {
      startScanner();
    } else {
      stopScanner();
      setScannedCode(null);
      setMatchedProduct(null);
      setCameraError(null);
      setManualCode('');
    }
    return () => {
      stopScanner();
    };
  }, [isOpen, startScanner, stopScanner]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleBarcodeFound(manualCode.trim());
  };

  const handleSellOne = async () => {
    if (!matchedProduct || isProcessing) return;
    setIsProcessing(true);
    try {
      await onRecordSale([{ productId: matchedProduct.productId, quantity: 1 }]);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddStock = async () => {
    if (!matchedProduct || isProcessing) return;
    setIsProcessing(true);
    try {
      await onRecordStockIn([{ productId: matchedProduct.productId, quantity: 10 }]);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveNewProduct = async () => {
    if (!scannedCode || !newProductName.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const newProd: Partial<InventoryItem> = {
        productId: `SKU-${Date.now().toString().slice(-4)}`,
        productName: newProductName.trim(),
        category: newProductCategory || 'General',
        retailPrice: parseFloat(newProductPrice) || 50,
        unitCost: Math.round((parseFloat(newProductPrice) || 50) * 0.8),
        stockOnHand: parseInt(newProductStock, 10) || 10,
        reorderLevel: 5,
        supplierLeadDays: 3,
        barcode: scannedCode,
      };

      if (onAddNewProduct) {
        await onAddNewProduct(newProd);
      }
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg mx-auto bg-white rounded-t-3xl max-h-[92vh] flex flex-col shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom-10">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              📷
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.title}</h3>
              <p className="text-xs text-slate-500">{t.scanHint}</p>
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
          {/* Viewfinder when scanning */}
          {!scannedCode && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center border-2 border-slate-800">
                <div id="barcode-scanner-view" className="w-full h-full" />
                {isScanning && (
                  <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-sm shadow-red-500 animate-pulse pointer-events-none" />
                )}
              </div>

              {cameraError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Manual code entry fallback */}
              <form onSubmit={handleManualSearch} className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-600">
                  {t.manualHint}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="e.g. 8901030383456"
                    className="flex-1 min-h-[48px] px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:border-purple-500 outline-hidden"
                  />
                  <button
                    type="submit"
                    className="min-h-[48px] px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs active:scale-95 transition-all"
                  >
                    {t.submitCode}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Matched Product Found Card */}
          {scannedCode && matchedProduct && (
            <div className="p-5 rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/60 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {t.productFound}
                </span>
                <span className="text-xs font-mono bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-slate-600">
                  {scannedCode}
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-1">
                <h4 className="text-base font-extrabold text-slate-900">
                  {matchedProduct.productName}
                </h4>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Category: {matchedProduct.category}</span>
                  <span className="font-bold text-slate-800">
                    Stock: {matchedProduct.stockOnHand}
                  </span>
                </div>
                <div className="text-lg font-extrabold text-emerald-700 pt-1">
                  {formatINR(matchedProduct.retailPrice)}
                </div>
              </div>

              {/* Quick Actions in thumb zone */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleSellOne}
                  disabled={isProcessing}
                  className="min-h-[52px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                  <TrendingDown className="h-4 w-4" />
                  <span>{t.sellOne}</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddStock}
                  disabled={isProcessing}
                  className="min-h-[52px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                  <PackagePlus className="h-4 w-4" />
                  <span>{t.addStock}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={startScanner}
                className="w-full min-h-[48px] rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{t.scanNext}</span>
              </button>
            </div>
          )}

          {/* Unknown Barcode: Add New Product Form */}
          {scannedCode && !matchedProduct && (
            <div className="p-4 rounded-2xl border-2 border-purple-500/50 bg-purple-50/50 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
                  {t.unknownProduct}
                </span>
                <span className="text-xs font-mono bg-white px-2 py-0.5 rounded-md border border-purple-200 text-purple-800">
                  {scannedCode}
                </span>
              </div>
              <p className="text-xs text-slate-600">{t.unknownDesc}</p>

              <div className="space-y-2.5 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {t.productName} *
                  </label>
                  <input
                    type="text"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="e.g. Tata Salt 1kg"
                    className="w-full min-h-[48px] px-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:border-purple-500 outline-hidden"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {t.retailPrice}
                    </label>
                    <input
                      type="number"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      className="w-full min-h-[48px] px-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:border-purple-500 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {t.stockOnHand}
                    </label>
                    <input
                      type="number"
                      value={newProductStock}
                      onChange={(e) => setNewProductStock(e.target.value)}
                      className="w-full min-h-[48px] px-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:border-purple-500 outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveNewProduct}
                  disabled={!newProductName.trim() || isProcessing}
                  className="w-full min-h-[52px] rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all disabled:opacity-50 mt-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>{isProcessing ? 'Saving...' : t.saveNewProduct}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={startScanner}
                className="w-full min-h-[48px] rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{t.scanNext}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
