'use client';

import React, { useState, useMemo } from 'react';
import { InventoryItem } from '@/lib/types';
import { SupportedLanguage } from '@/lib/i18n';
import { Search, X, Trash2, Check, Plus } from 'lucide-react';
import { formatINR } from '@/lib/analytics';

interface QuickSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onSaveSale: (
    lines: { productId: string; quantity: number; unitPrice?: number }[]
  ) => Promise<void>;
  lang?: SupportedLanguage;
}

interface CartItem {
  product: InventoryItem;
  quantity: number;
}

export const QuickSaleModal: React.FC<QuickSaleModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onSaveSale,
  lang = 'en',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Top 8 frequent/common items for quick chip access
  const topChips = useMemo(() => {
    return inventory.slice(0, 8);
  }, [inventory]);

  // Filtered list when searching
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return inventory.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.productId.toLowerCase().includes(q)
    );
  }, [inventory, searchQuery]);

  if (!isOpen) return null;

  const currentCartItem = cart.find((c) => c.product.productId === selectedProductId);

  // Add item or increment
  const handleAddItem = (product: InventoryItem, initialQty = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.product.productId === product.productId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + initialQty };
        return next;
      }
      return [...prev, { product, quantity: initialQty }];
    });
    setSelectedProductId(product.productId);
  };

  // Modify quantity of selected item via keypad
  const handleKeypadDigit = (digit: string) => {
    if (!selectedProductId) return;
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.productId !== selectedProductId) return item;
        const currentStr = String(item.quantity);
        // Replace if just 1 on first tap or append
        const newStr = item.quantity === 0 ? digit : `${currentStr}${digit}`;
        const newQty = parseInt(newStr, 10) || 1;
        return { ...item, quantity: Math.min(9999, newQty) };
      })
    );
  };

  const handleKeypadQuickAdd = (amount: number) => {
    if (!selectedProductId) return;
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.productId !== selectedProductId) return item;
        return { ...item, quantity: item.quantity + amount };
      })
    );
  };

  const handleKeypadClear = () => {
    if (!selectedProductId) return;
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.productId !== selectedProductId) return item;
        return { ...item, quantity: 1 };
      })
    );
  };

  const handleKeypadBackspace = () => {
    if (!selectedProductId) return;
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.productId !== selectedProductId) return item;
        const str = String(item.quantity);
        const newQty = str.length > 1 ? parseInt(str.slice(0, -1), 10) : 1;
        return { ...item, quantity: newQty };
      })
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.product.productId !== productId));
    if (selectedProductId === productId) {
      setSelectedProductId(null);
    }
  };

  // Calculate totals
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.quantity * item.product.retailPrice,
    0
  );
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSave = async () => {
    if (cart.length === 0 || isSaving) return;
    setIsSaving(true);
    try {
      const lines = cart.map((c) => ({
        productId: c.product.productId,
        quantity: c.quantity,
        unitPrice: c.product.retailPrice,
      }));
      await onSaveSale(lines);
      setCart([]);
      setSelectedProductId(null);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const t = {
    en: {
      title: 'Quick Sale Entry',
      search: 'Search product or brand...',
      saveSale: 'Save Sale',
      emptyCart: 'Tap an item above to add to bill',
      runningTotal: 'Total',
      items: 'items',
    },
    kn: {
      title: 'ತ್ವರಿತ ಮಾರಾಟ ದಾಖಲೆ',
      search: 'ಉತ್ಪನ್ನದ ಹೆಸರು ಹುಡುಕಿ...',
      saveSale: 'ಮಾರಾಟ ಉಳಿಸಿ (Save)',
      emptyCart: 'ಬಿಲ್ ಸೇರಿಸಲು ಮೇಲಿನ ಸರಕನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ',
      runningTotal: 'ಒಟ್ಟು ಮೊತ್ತ',
      items: 'ಯೂನಿಟ್‌ಗಳು',
    },
    hi: {
      title: 'त्वरित बिक्री (Quick Sale)',
      search: 'उत्पाद का नाम खोजें...',
      saveSale: 'बिक्री दर्ज करें',
      emptyCart: 'बिल में जोड़ने के लिए ऊपर किसी सामान को छुएं',
      runningTotal: 'कुल योग',
      items: 'आइटम',
    },
  }[lang] || {
    title: 'Quick Sale Entry',
    search: 'Search product or brand...',
    saveSale: 'Save Sale',
    emptyCart: 'Tap an item above to add to bill',
    runningTotal: 'Total',
    items: 'items',
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg mx-auto bg-white rounded-t-3xl max-h-[92vh] flex flex-col shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom-10">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.title}</h3>
              <p className="text-xs text-slate-500">Tap items • adjust with keypad</p>
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

        {/* Content Body (Scrollable) */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="w-full min-h-[48px] pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:border-emerald-500 outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown if query entered */}
          {searchQuery && filteredProducts.length > 0 && (
            <div className="max-h-48 overflow-y-auto border border-emerald-200 rounded-xl bg-emerald-50/50 p-2 space-y-1">
              {filteredProducts.map((p) => (
                <button
                  key={p.productId}
                  type="button"
                  onClick={() => {
                    handleAddItem(p);
                    setSearchQuery('');
                  }}
                  className="w-full min-h-[48px] p-2.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 text-left flex items-center justify-between active:scale-98 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {p.productName}
                    </div>
                    <div className="text-xs text-slate-500">
                      Stock: {p.stockOnHand} • Price: {formatINR(p.retailPrice)}
                    </div>
                  </div>
                  <Plus className="h-4 w-4 text-emerald-600 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}

          {/* Top 8 Fast Tap Chips */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Frequent Items (Tap to Add 1):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {topChips.map((p) => {
                const inCart = cart.find((c) => c.product.productId === p.productId);
                return (
                  <button
                    key={p.productId}
                    type="button"
                    onClick={() => handleAddItem(p)}
                    className={`min-h-[52px] p-2.5 rounded-xl border text-left flex flex-col justify-center active:scale-95 transition-all ${
                      inCart
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold truncate leading-tight">
                      {p.productName}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
                      <span>{formatINR(p.retailPrice)}</span>
                      {inCart && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-200/60 px-1.5 py-0.2 rounded-full">
                          ×{inCart.quantity}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cart Multi-Line List */}
          <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
              <span>Bill Lines ({cart.length})</span>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-red-600 hover:text-red-700 text-xs font-semibold"
                >
                  Clear all
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                {t.emptyCart}
              </div>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {cart.map((item) => {
                  const isSelected = selectedProductId === item.product.productId;
                  return (
                    <div
                      key={item.product.productId}
                      onClick={() => setSelectedProductId(item.product.productId)}
                      className={`min-h-[48px] p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {item.product.productName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {formatINR(item.product.retailPrice)} each
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-lg">
                          × {item.quantity}
                        </span>
                        <span className="text-xs font-bold text-slate-900 w-16 text-right">
                          {formatINR(item.quantity * item.product.retailPrice)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(item.product.productId);
                          }}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-red-600 rounded-lg active:scale-95"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Large Numeric Keypad */}
          {selectedProductId && currentCartItem && (
            <div className="border border-slate-200 rounded-2xl p-3 bg-white space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs px-1 font-semibold text-slate-600">
                <span>Quantity Keypad for: <strong className="text-emerald-700 truncate max-w-[180px] inline-block align-bottom">{currentCartItem.product.productName}</strong></span>
                <span className="text-emerald-700 font-extrabold text-sm">{currentCartItem.quantity} units</span>
              </div>

              {/* Quick increment buttons */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleKeypadQuickAdd(1)}
                  className="min-h-[48px] rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 text-sm active:scale-95"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadQuickAdd(5)}
                  className="min-h-[48px] rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 text-sm active:scale-95"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadQuickAdd(10)}
                  className="min-h-[48px] rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 text-sm active:scale-95"
                >
                  +10
                </button>
                <button
                  type="button"
                  onClick={handleKeypadClear}
                  className="min-h-[48px] rounded-xl bg-amber-50 hover:bg-amber-100 font-bold text-amber-800 text-xs active:scale-95"
                >
                  Reset 1
                </button>
              </div>

              {/* Number pad 0-9 */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadDigit(digit)}
                    className="min-h-[50px] rounded-xl bg-slate-50 hover:bg-slate-100 font-extrabold text-slate-900 text-lg border border-slate-200 active:scale-95 transition-all shadow-2xs"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleKeypadDigit('0')}
                  className="min-h-[50px] rounded-xl bg-slate-50 hover:bg-slate-100 font-extrabold text-slate-900 text-lg border border-slate-200 active:scale-95"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadDigit('00')}
                  className="min-h-[50px] rounded-xl bg-slate-50 hover:bg-slate-100 font-extrabold text-slate-900 text-sm border border-slate-200 active:scale-95"
                >
                  00
                </button>
                <button
                  type="button"
                  onClick={handleKeypadBackspace}
                  className="min-h-[50px] rounded-xl bg-red-50 hover:bg-red-100 font-bold text-red-700 text-sm border border-red-200 active:scale-95 flex items-center justify-center"
                >
                  ⌫ Back
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Bottom Thumb Zone */}
        <div className="p-4 border-t border-slate-200 bg-white shrink-0 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-500">
              {t.runningTotal} ({totalItemsCount} {t.items}):
            </span>
            <span className="text-xl font-extrabold text-slate-900">
              {formatINR(totalAmount)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={cart.length === 0 || isSaving}
            className="w-full min-h-[56px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            <Check className="h-5 w-5" />
            <span>
              {isSaving ? 'Recording...' : `${t.saveSale} • ${formatINR(totalAmount)}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
