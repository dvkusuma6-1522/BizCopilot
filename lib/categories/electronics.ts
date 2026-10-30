import { CategoryConfig } from './types';
import { InventoryItem, SalesRecord } from '@/lib/types';

export const electronicsCategory: CategoryConfig = {
  id: 'electronics',
  icon: 'Smartphone',
  labels: {
    en: 'Mobiles & Electronics',
    kn: 'ಮೊಬೈಲ್ & ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ (Electronics)',
    hi: 'मोबाइल एवं इलेक्ट्रॉनिक्स (Electronics)',
  },
  description: {
    en: 'Mobile phone showrooms, electronics retailers, gadget shops, and computer accessories',
    kn: 'ಮೊಬೈಲ್ ಶೋರೂಮ್‌ಗಳು, ಗ್ಯಾಜೆಟ್ ಅಂಗಡಿ ಮತ್ತು ಕಂಪ್ಯೂಟರ್ ಉಪಕರಣಗಳ ಮಳಿಗೆ',
    hi: 'मोबाइल फोन शोरूम, गैजेट स्टोर, इलेक्ट्रॉनिक सामान और कंप्यूटर एक्सेसरीज',
  },
  defaultBufferDays: 7,
  defaultLeadDays: 3,
  productFields: [
    {
      key: 'brand',
      label: { en: 'Brand', kn: 'ಬ್ರ್ಯಾಂಡ್', hi: 'ब्रांड' },
      type: 'text',
      isGridColumn: true,
      format: (v) => String(v || '-'),
    },
    {
      key: 'warrantyMonths',
      label: { en: 'Warranty', kn: 'ವಾರಂಟಿ (ತಿಂಗಳು)', hi: 'वारंटी (महीने)' },
      type: 'number',
      isGridColumn: true,
      format: (v) => (v ? `${v}m` : '-'),
    },
    {
      key: 'mrp',
      label: { en: 'MRP (₹)', kn: 'ಗರಿಷ್ಠ ಮಾರಾಟ ಬೆಲೆ (MRP)', hi: 'एमआरपी (MRP)' },
      type: 'number',
      isGridColumn: true,
      format: (v) => (v ? `₹${v}` : '-'),
    },
  ],
  terms: {
    stock: { en: 'Devices in Safe & Display', kn: 'ಪ್ರದರ್ಶನ & ಲಾಕರ್‌ನಲ್ಲಿರುವ ಸಾಧನಗಳು', hi: 'डिस्प्ले और सेफ में उपलब्ध गैजेट्स' },
    supplier: { en: 'Brand C&F / Distributor', kn: 'ಬ್ರ್ಯಾಂಡ್ C&F ವಿತರಕರು', hi: 'ब्रांड डिस्ट्रीब्यूटर' },
    leadTime: { en: 'Stock Delivery Days', kn: 'ಸ್ಟಾಕ್ ತಲುಪುವ ದಿನಗಳು', hi: 'माल पहुंचने का समय' },
    itemUnit: { en: 'devices / units', kn: 'ಸಾಧನ / ಪೀಸ್', hi: 'डिवाइस / पीस' },
    reorderAction: { en: 'Indent Brand Stock', kn: 'ಬ್ರ್ಯಾಂಡ್ ಸ್ಟಾಕ್ ಇಂಡೆಂಟ್ ಮಾಡಿ', hi: 'ब्रांड डिस्ट्रीब्यूटर को ऑर्डर दें' },
  },
  alertRules: [
    {
      id: 'electronics_depreciation_risk',
      priority: 'warning',
      evaluate: ({ inventory }) => {
        return inventory
          .filter((i) => i.isDeadStock)
          .map((item) => ({
            triggered: true,
            productId: item.productId,
            productName: item.productName,
            headline: {
              en: `Rapid price drop risk: ${item.productName}`,
              kn: `${item.productName} ಬೆಲೆ ಕುಸಿತದ ಅಪಾಯ`,
              hi: `${item.productName} की कीमत गिरने का जोखिम`,
            },
            explanation: {
              en: `${item.stockOnHand} units unsold with ₹${item.deadStockValue.toLocaleString('en-IN')} locked. Tech models depreciate fast as newer models launch.`,
              kn: `${item.stockOnHand} ಸಾಧನಗಳು ಮಾರಾಟವಾಗದೆ ₹${item.deadStockValue.toLocaleString('en-IN')} ಸಿಲುಕಿದೆ. ಹೊಸ ಮಾಡೆಲ್ ಬಂದಂತೆ ಬೆಲೆ ಇಳಿಯುವ ಭೀತಿಯಿದೆ.`,
              hi: `${item.stockOnHand} फोन/गैजेट्स बिना बिके पड़े हैं और ₹${item.deadStockValue.toLocaleString('en-IN')} फंसे हैं। नए मॉडल आने पर कीमत तेजी से गिरती है।`,
            },
            supportingData: `Units: ${item.stockOnHand} | Capital: ₹${item.deadStockValue.toLocaleString('en-IN')}`,
            suggestedAction: {
              en: 'Offer bundled free tempered glass/cover or 10% promotional cash discount.',
              kn: 'ಉಚಿತ ಟೆಂಪರ್ಡ್ ಗ್ಲಾಸ್ ಆಫರ್ ನೀಡಿ ಅಥವಾ 10% ಡಿಸ್ಕೌಂಟ್‌ನಲ್ಲಿ ತಕ್ಷಣ ಕ್ಲಿಯರ್ ಮಾಡಿ.',
              hi: 'फ्री बैक कवर/ग्लास का ऑफर दें या 10% छूट देकर तुरंत स्टॉक निकालें।',
            },
            impactValue: item.deadStockValue,
            section: 'week',
          }));
      },
    },
    {
      id: 'electronics_fast_stockout',
      priority: 'critical',
      evaluate: ({ inventory }) => {
        return inventory
          .filter((i) => i.isStockoutRisk)
          .map((item) => ({
            triggered: true,
            productId: item.productId,
            productName: item.productName,
            headline: {
              en: `High-demand ${item.productName} running out`,
              kn: `ಹೆಚ್ಚು ಬೇಡಿಕೆಯ ${item.productName} ಖಾಲಿಯಾಗುತ್ತಿದೆ`,
              hi: `तेजी से बिकने वाला ${item.productName} खत्म हो रहा है`,
            },
            explanation: {
              en: `Only ${item.daysOfCover} days of shelf stock left. Brand distributor transit takes ${item.supplierLeadDays} days.`,
              kn: `ಕೇವಲ ${item.daysOfCover} ದಿನಗಳ ದಾಸ್ತಾನು ಉಳಿದಿದೆ. ಬ್ರ್ಯಾಂಡ್ ಪೂರೈಕೆಗೆ ${item.supplierLeadDays} ದಿನ ಬೇಕು.`,
              hi: `केवल ${item.daysOfCover} दिन का स्टॉक बाकी है। डिस्ट्रीब्यूटर से आने में ${item.supplierLeadDays} दिन लगते हैं।`,
            },
            supportingData: `Stock: ${item.stockOnHand} | Velocity: ~${item.avgDailySales}/day | Lead: ${item.supplierLeadDays}d`,
            suggestedAction: {
              en: `Indent ${item.recommendedReorderQty} units from brand C&F distributor today.`,
              kn: `ಇಂದೇ ಬ್ರ್ಯಾಂಡ್ C&F ವಿತರಕರಿಗೆ ${item.recommendedReorderQty} ಯೂನಿಟ್‌ಗಳ ಇಂಡೆಂಟ್ ಕಳುಹಿಸಿ.`,
              hi: `आज ही ब्रांड C&F डिस्ट्रीब्यूटर को ${item.recommendedReorderQty} यूनिट्स का इंडेंट भेजें।`,
            },
            impactValue: item.recommendedReorderQty * item.retailPrice,
            section: 'today',
          }));
      },
    },
  ],
  kpis: [
    {
      id: 'electronics_aging_stock',
      label: { en: 'Aging Device Capital', kn: 'ಹಳೆಯ ಮಾಡೆಲ್‌ಗಳಲ್ಲಿ ಸಿಲುಕಿರುವ ಬಂಡವಾಳ', hi: 'पुराने मॉडल्स में फंसी पूंजी' },
      tooltip: { en: 'Capital locked in devices and electronics with zero sales over past 30 days', kn: 'ಕಳೆದ 30 ದಿನಗಳಲ್ಲಿ ಮಾರಾಟವಾಗದ ಮೊಬೈಲ್ ಮತ್ತು ಗ್ಯಾಜೆಟ್‌ಗಳ ಒಟ್ಟು ಮೌಲ್ಯ', hi: 'पिछले 30 दिनों में बिना बिके गैजेट्स की कुल पूंजी' },
      compute: ({ inventory }) => {
        const deadTotal = inventory
          .filter((i) => i.isDeadStock)
          .reduce((sum, i) => sum + i.deadStockValue, 0);
        return {
          value: `₹${deadTotal.toLocaleString('en-IN')}`,
          numericValue: deadTotal,
          status: deadTotal > 30000 ? 'critical' : deadTotal > 0 ? 'warning' : 'optimal',
          sublabel: deadTotal > 0 ? 'Promotional bundle needed' : 'Fast model turnover',
        };
      },
    },
  ],
  seasonality: [
    {
      id: 'diwali_tech_deals',
      name: { en: 'Diwali Festive Tech Offers', kn: 'ದೀಪಾವಳಿ ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಆಫರ್', hi: 'दिवाली इलेक्ट्रॉनिक्स ऑफर्स' },
      startMonth: 10,
      startDay: 15,
      endMonth: 11,
      endDay: 15,
      multiplier: 1.6,
      rationale: { en: 'Smartphones, smartwatches, power banks, and audio headsets jump +60% during Diwali week.', kn: 'ದೀಪಾವಳಿ ಸಂದರ್ಭದಲ್ಲಿ ಸ್ಮಾರ್ಟ್‌ಫೋನ್ ಮತ್ತು ಗ್ಯಾಜೆಟ್‌ಗಳ ಮಾರಾಟ 60% ಜಿಗಿಯುತ್ತದೆ.', hi: 'दिवाली के दौरान स्मार्टफोन और ऑडियो गैजेट्स की मांग 60% बढ़ जाती है।' },
    },
  ],
  whatsappTemplates: {
    order: (storeName, productName, qty, _extra, lang = 'en') => {
      if (lang === 'kn') {
        return `ನಮಸ್ಕಾರ, ${storeName} ಮೊಬೈಲ್ಸ್‌ನಿಂದ. ನಮಗೆ ${productName} ನ ${qty} ಯೂನಿಟ್‌ಗಳು ಬೇಕಾಗಿದೆ. ದಯವಿಟ್ಟು ಇಂದೇ ಬಿಲ್ಲಿಂಗ್ ಮಾಡಿ ಕಳುಹಿಸಿ. ಧನ್ಯವಾದಗಳು!`;
      }
      if (lang === 'hi') {
        return `नमस्ते, ${storeName} इलेक्ट्रॉनिक्स से। हमें ${productName} के ${qty} पीस चाहिए। कृपया आज ही बिल बनाकर भेजें। धन्यवाद!`;
      }
      return `Hello from ${storeName}. Please bill and dispatch ${qty} units of ${productName} on today's courier run. Thank you!`;
    },
    summary: (storeName, salesStr, riskCount, lang = 'en') => {
      if (lang === 'kn') {
        return `*${storeName} ಮೊಬೈಲ್ ವರದಿ*\nದೈನಂದಿನ ಬಿಲ್ಲಿಂಗ್: ${salesStr}\nಸ್ಟಾಕೌಟ್ ಅಪಾಯವಿರುವ ಸಾಧನಗಳು: ${riskCount}\nBizCopilot ಮೂಲಕ ಕಳುಹಿಸಲಾಗಿದೆ.`;
      }
      if (lang === 'hi') {
        return `*${storeName} इलेक्ट्रॉनिक्स रिपोर्ट*\nदैनिक बिलिंग: ${salesStr}\nस्टॉकout खतरे वाले मॉडल: ${riskCount}\nBizCopilot द्वारा भेजा गया।`;
      }
      return `*${storeName} Electronics Summary*\nDaily Turnover: ${salesStr}\nStockout Risks: ${riskCount}\nGenerated by BizCopilot.`;
    },
  },
  demoDataset: () => {
    const products: InventoryItem[] = [
      {
        productId: 'ELC-5G-PHONE',
        productName: 'Redmi 13C 5G Smartphone (4GB/128GB)',
        category: 'Smartphones',
        stockOnHand: 3, // Stockout candidate: velocity 1.8/day, lead 3d -> 1.6d cover!
        reorderLevel: 8,
        supplierLeadDays: 3,
        unitCost: 8900,
        retailPrice: 10499,
        attributes: { brand: 'Xiaomi', warrantyMonths: 12, mrp: 11999 },
      },
      {
        productId: 'ELC-TWS-BUDS',
        productName: 'boAt Airdopes 141 ANC Bluetooth Earbuds',
        category: 'Audio & Wearables',
        stockOnHand: 14,
        reorderLevel: 10,
        supplierLeadDays: 3,
        unitCost: 1100,
        retailPrice: 1599,
        attributes: { brand: 'boAt', warrantyMonths: 12, mrp: 1990 },
      },
      {
        productId: 'ELC-FAST-CHG',
        productName: 'Portronics 65W GaN Fast Charger Type-C',
        category: 'Accessories',
        stockOnHand: 5, // stockout candidate
        reorderLevel: 8,
        supplierLeadDays: 2,
        unitCost: 750,
        retailPrice: 1199,
        attributes: { brand: 'Portronics', warrantyMonths: 12, mrp: 1499 },
      },
      {
        productId: 'ELC-PWR-BANK',
        productName: 'Mi 20000mAh Power Bank 3i (18W Fast Charge)',
        category: 'Power & Cables',
        stockOnHand: 9,
        reorderLevel: 6,
        supplierLeadDays: 3,
        unitCost: 1450,
        retailPrice: 1999,
        attributes: { brand: 'Xiaomi', warrantyMonths: 6, mrp: 2199 },
      },
      {
        productId: 'ELC-SMART-WATCH',
        productName: 'Noise Pulse 2 Max 1.85 Inch BT Calling Watch',
        category: 'Audio & Wearables',
        stockOnHand: 18, // Slow-moving candidate
        reorderLevel: 8,
        supplierLeadDays: 3,
        unitCost: 1250,
        retailPrice: 1799,
        attributes: { brand: 'Noise', warrantyMonths: 12, mrp: 2499 },
      },
      {
        productId: 'ELC-OTG-PEND',
        productName: 'SanDisk Ultra Dual 64GB USB 3.1 Type-C Drive',
        category: 'Storage & Memory',
        stockOnHand: 25,
        reorderLevel: 15,
        supplierLeadDays: 2,
        unitCost: 520,
        retailPrice: 750,
        attributes: { brand: 'SanDisk', warrantyMonths: 60, mrp: 850 },
      },
      {
        productId: 'ELC-TEMPER-GLS',
        productName: '9D Edge-to-Edge Tempered Glass (Assorted 50pk)',
        category: 'Screen Guards',
        stockOnHand: 40,
        reorderLevel: 25,
        supplierLeadDays: 2,
        unitCost: 35,
        retailPrice: 150,
        attributes: { brand: 'Universal', warrantyMonths: 0, mrp: 199 },
      },
      {
        productId: 'ELC-BT-SPEAKER',
        productName: 'JBL GO 3 Ultra-Portable Waterproof Speaker',
        category: 'Audio & Wearables',
        stockOnHand: 6,
        reorderLevel: 4,
        supplierLeadDays: 4,
        unitCost: 2400,
        retailPrice: 3299,
        attributes: { brand: 'JBL', warrantyMonths: 12, mrp: 3999 },
      },
      {
        productId: 'ELC-TYPE-C-CAB',
        productName: 'Ambrane Unbreakable Braided Type-C Cable 1.5m',
        category: 'Power & Cables',
        stockOnHand: 30,
        reorderLevel: 15,
        supplierLeadDays: 2,
        unitCost: 110,
        retailPrice: 249,
        attributes: { brand: 'Ambrane', warrantyMonths: 6, mrp: 299 },
      },
      {
        productId: 'ELC-NECKBAND',
        productName: 'OnePlus Bullets Wireless Z2 Bluetooth Neckband',
        category: 'Audio & Wearables',
        stockOnHand: 11,
        reorderLevel: 8,
        supplierLeadDays: 3,
        unitCost: 1400,
        retailPrice: 1899,
        attributes: { brand: 'OnePlus', warrantyMonths: 12, mrp: 2299 },
      },
      {
        productId: 'ELC-KEYBOARD-M',
        productName: 'Logitech MK215 Wireless Keyboard and Mouse Combo',
        category: 'Computer Accessories',
        stockOnHand: 8,
        reorderLevel: 5,
        supplierLeadDays: 4,
        unitCost: 1150,
        retailPrice: 1595,
        attributes: { brand: 'Logitech', warrantyMonths: 36, mrp: 1745 },
      },
      {
        productId: 'ELC-EXT-STRIP',
        productName: 'GM 4+1 Power Spike Strip with Surge Protector',
        category: 'Accessories',
        stockOnHand: 16,
        reorderLevel: 10,
        supplierLeadDays: 2,
        unitCost: 380,
        retailPrice: 560,
        attributes: { brand: 'GM Modular', warrantyMonths: 12, mrp: 620 },
      },
    ];

    const sales: SalesRecord[] = [];
    const today = new Date('2026-10-30T00:00:00');
    for (let i = 14; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      sales.push({ date: dateStr, productId: 'ELC-5G-PHONE', productName: 'Redmi 13C 5G Smartphone (4GB/128GB)', category: 'Smartphones', unitsSold: 2, unitPrice: 10499 });
      sales.push({ date: dateStr, productId: 'ELC-TWS-BUDS', productName: 'boAt Airdopes 141 ANC Bluetooth Earbuds', category: 'Audio & Wearables', unitsSold: 2, unitPrice: 1599 });
      sales.push({ date: dateStr, productId: 'ELC-FAST-CHG', productName: 'Portronics 65W GaN Fast Charger Type-C', category: 'Accessories', unitsSold: 3, unitPrice: 1199 }); // fast mover -> stockout
      sales.push({ date: dateStr, productId: 'ELC-PWR-BANK', productName: 'Mi 20000mAh Power Bank 3i (18W Fast Charge)', category: 'Power & Cables', unitsSold: 1, unitPrice: 1999 });
      sales.push({ date: dateStr, productId: 'ELC-SMART-WATCH', productName: 'Noise Pulse 2 Max 1.85 Inch BT Calling Watch', category: 'Audio & Wearables', unitsSold: 0, unitPrice: 1799 }); // slow mover
      sales.push({ date: dateStr, productId: 'ELC-OTG-PEND', productName: 'SanDisk Ultra Dual 64GB USB 3.1 Type-C Drive', category: 'Storage & Memory', unitsSold: 2, unitPrice: 750 });
      sales.push({ date: dateStr, productId: 'ELC-TEMPER-GLS', productName: '9D Edge-to-Edge Tempered Glass (Assorted 50pk)', category: 'Screen Guards', unitsSold: 5, unitPrice: 150 });
      sales.push({ date: dateStr, productId: 'ELC-BT-SPEAKER', productName: 'JBL GO 3 Ultra-Portable Waterproof Speaker', category: 'Audio & Wearables', unitsSold: 1, unitPrice: 3299 });
      sales.push({ date: dateStr, productId: 'ELC-TYPE-C-CAB', productName: 'Ambrane Unbreakable Braided Type-C Cable 1.5m', category: 'Power & Cables', unitsSold: 4, unitPrice: 249 });
      sales.push({ date: dateStr, productId: 'ELC-NECKBAND', productName: 'OnePlus Bullets Wireless Z2 Bluetooth Neckband', category: 'Audio & Wearables', unitsSold: 2, unitPrice: 1899 });
      sales.push({ date: dateStr, productId: 'ELC-KEYBOARD-M', productName: 'Logitech MK215 Wireless Keyboard and Mouse Combo', category: 'Computer Accessories', unitsSold: 1, unitPrice: 1595 });
      sales.push({ date: dateStr, productId: 'ELC-EXT-STRIP', productName: 'GM 4+1 Power Spike Strip with Surge Protector', category: 'Accessories', unitsSold: 1, unitPrice: 560 });
    }

    return {
      store: {
        name: 'TechPoint Mobiles & Electronics',
        type: 'Mobile Phones, Audio & Gadgets',
        location: 'SP Road & Koramangala, Bengaluru',
      },
      products,
      sales,
    };
  },
};
