import { CategoryConfig } from './types';
import { InventoryItem, SalesRecord } from '@/lib/types';

export const salonCategory: CategoryConfig = {
  id: 'salon',
  icon: 'Scissors',
  labels: {
    en: 'Salon & Spa Consumables',
    kn: 'ಸಲೂನ್ & ಬ್ಯೂಟಿ ಪಾರ್ಲರ್ (Salon)',
    hi: 'सैलून एवं ब्यूटी पार्लर (Salon)',
  },
  description: {
    en: 'Beauty parlors, hair salons, grooming studios, and spa consumable inventory',
    kn: 'ಬ್ಯೂಟಿ ಪಾರ್ಲರ್‌ಗಳು, ಕೇಶ ವಿನ್ಯಾಸ ಮಳಿಗೆ ಮತ್ತು ಸ್ಪಾ ಸಾಮಗ್ರಿಗಳ ದಾಸ್ತಾನು',
    hi: 'ब्यूटी पार्लर, हेयर सैलून, स्पा और ग्रूमिंग स्टूडियो सामग्री',
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
      key: 'volumeMl',
      label: { en: 'Pack Volume / Size', kn: 'ಪ್ಯಾಕ್ ಪ್ರಮಾಣ', hi: 'मात्रा / साइज' },
      type: 'text',
      isGridColumn: true,
      format: (v) => String(v || '-'),
    },
    {
      key: 'mrp',
      label: { en: 'Retail MRP (₹)', kn: 'ಚಿಲ್ಲರೆ ಬೆಲೆ (MRP)', hi: 'एमआरपी (MRP)' },
      type: 'number',
      isGridColumn: true,
      format: (v) => (v ? `₹${v}` : '-'),
    },
  ],
  terms: {
    stock: { en: 'Backbar & Retail Consumables', kn: 'ಬ್ಯಾಕ್‌ಬಾರ್ ಮತ್ತು ಚಿಲ್ಲರೆ ಸರಕು', hi: 'सर्विस बैकबार एवं रिटेल सामान' },
    supplier: { en: 'Salon Product Distributor', kn: 'ಕಾಸ್ಮೆಟಿಕ್ ವಿತರಕರು', hi: 'सैलून कॉस्मेटिक डिस्ट्रीब्यूटर' },
    leadTime: { en: 'Supply Transit Days', kn: 'ಸರಕು ತಲುಪುವ ದಿನಗಳು', hi: 'सप्लाई पहुंचने के दिन' },
    itemUnit: { en: 'tubes / bottles / kits', kn: 'ಟ್ಯೂಬ್ / ಬಾಟಲ್ / ಕಿಟ್', hi: 'ट्यूब / बोतल / किट' },
    reorderAction: { en: 'Indent Salon Stock', kn: 'ಪಾರ್ಲರ್ ಸ್ಟಾಕ್ ಇಂಡೆಂಟ್ ಮಾಡಿ', hi: 'सैलून स्टॉक ऑर्डर करें' },
  },
  alertRules: [
    {
      id: 'salon_stockout_weekend',
      priority: 'critical',
      evaluate: ({ inventory }) => {
        return inventory
          .filter((i) => i.isStockoutRisk)
          .map((item) => ({
            triggered: true,
            productId: item.productId,
            productName: item.productName,
            headline: {
              en: `Backbar essential ${item.productName} running out`,
              kn: `ಸಲೂನ್ ಅಗತ್ಯ ಸಾಮಗ್ರಿ ${item.productName} ಖಾಲಿಯಾಗುತ್ತಿದೆ`,
              hi: `सैलून की मुख्य सामग्री ${item.productName} खत्म हो रही है`,
            },
            explanation: {
              en: `Only ${item.daysOfCover} days of service sessions left. Distributor requires ${item.supplierLeadDays} days.`,
              kn: `ಕೇವಲ ${item.daysOfCover} ದಿನಗಳ ಸೇವೆಗಳಿಗೆ ಸಾಕಾಗುವಷ್ಟೇ ಇದೆ (ಡೆಲಿವರಿಗೆ ${item.supplierLeadDays} ದಿನ ಬೇಕು).`,
              hi: `केवल ${item.daysOfCover} दिन की सर्विस का स्टॉक बचा है (सप्लाई में ${item.supplierLeadDays} दिन लगते हैं)।`,
            },
            supportingData: `Units: ${item.stockOnHand} | Usage: ~${item.avgDailySales}/day | Lead: ${item.supplierLeadDays}d`,
            suggestedAction: {
              en: `Order ${item.recommendedReorderQty} units today before weekend customer bookings.`,
              kn: `ವಾರಾಂತ್ಯದ ಗ್ರಾಹಕರ ಬುಕಿಂಗ್‌ಗೂ ಮುನ್ನ ಇಂದೇ ${item.recommendedReorderQty} ಯೂನಿಟ್‌ಗಳನ್ನು ಆರ್ಡರ್ ಮಾಡಿ.`,
              hi: `वीकेंड की बुकिंग से पहले आज ही ${item.recommendedReorderQty} यूनिट्स ऑर्डर करें।`,
            },
            impactValue: item.recommendedReorderQty * item.retailPrice,
            section: 'today',
          }));
      },
    },
  ],
  kpis: [
    {
      id: 'salon_backbar_stockouts',
      label: { en: 'Low Backbar Items', kn: 'ಖಾಲಿಯಾಗುವ ಪಾರ್ಲರ್ ಸಾಮಗ್ರಿಗಳು', hi: 'कम स्टॉक वाले ब्यूटी प्रोडक्ट्स' },
      tooltip: { en: 'Consumables with stock cover below supplier delivery turnaround', kn: 'ಪೂರೈಕೆ ಸಮಯಕ್ಕಿಂತ ಕಡಿಮೆ ದಾಸ್ತಾನು ಇರುವ ಬ್ಯೂಟಿ ಉತ್ಪನ್ನಗಳು', hi: 'प्रोडक्ट्स जिनका स्टॉक सप्लाई समय से कम है' },
      compute: ({ inventory }) => {
        const count = inventory.filter((i) => i.isStockoutRisk).length;
        return {
          value: `${count} Products`,
          numericValue: count,
          status: count > 0 ? 'critical' : 'optimal',
          sublabel: count > 0 ? 'Replenish before Friday' : 'All backbar ready',
        };
      },
    },
  ],
  seasonality: [
    {
      id: 'salon_festive_bridal',
      name: { en: 'Bridal & Festive Grooming Rush', kn: 'ಮದುವೆ & ಹಬ್ಬದ ಬ್ರೈಡಲ್ ಸೀಸನ್', hi: 'ब्राइडल व फेस्टिव ग्रूमिंग' },
      startMonth: 10,
      startDay: 15,
      endMonth: 1,
      endDay: 20,
      multiplier: 1.5,
      rationale: { en: 'Facial kits, hair coloring, keratin treatments, and bridal makeup jump +50%.', kn: 'ಮದುವೆ ಸೀಸನ್‌ನಲ್ಲಿ ಫೇಷಿಯಲ್ ಮತ್ತು ಹೇರ್ ಟ್ರೀಟ್‌ಮೆಂಟ್ ಬಳಕೆ 50% ಹೆಚ್ಚಳ.', hi: 'शादी के सीजन में फेशियल, हेयर कलर और मेकअप की मांग 50% बढ़ती है।' },
    },
  ],
  whatsappTemplates: {
    order: (storeName, productName, qty, _extra, lang = 'en') => {
      if (lang === 'kn') {
        return `ನಮಸ್ಕಾರ, ${storeName} ಸಲೂನ್‌ನಿಂದ. ನಮಗೆ ${productName} ನ ${qty} ಯೂನಿಟ್‌ಗಳು ಬೇಕಾಗಿದೆ. ದಯವಿಟ್ಟು ಬೇಗ ಪಾರ್ಸಲ್ ಕಳುಹಿಸಿ. ಧನ್ಯವಾದಗಳು!`;
      }
      if (lang === 'hi') {
        return `नमस्ते, ${storeName} सैलून से। हमें ${productName} के ${qty} पीस चाहिए। कृपया जल्द सप्लाई भेजें। धन्यवाद!`;
      }
      return `Hello from ${storeName}. Please bill and dispatch ${qty} units of professional ${productName}. Thank you!`;
    },
    summary: (storeName, salesStr, riskCount) => {
      return `*${storeName} Salon Backbar Update*\nDaily Service Revenue: ${salesStr}\nDepleted Backbar SKUs: ${riskCount}\nGenerated by BizCopilot.`;
    },
  },
  demoDataset: () => {
    const products: InventoryItem[] = [
      {
        productId: 'SLN-SHAMP-1L',
        productName: 'L’Oréal Professionnel Mythic Oil Shampoo 1.5L',
        category: 'Hair Care Backbar',
        stockOnHand: 3, // Stockout candidate: velocity ~1.5/day, lead 3d -> 2d cover
        reorderLevel: 5,
        supplierLeadDays: 3,
        unitCost: 1400,
        retailPrice: 1950,
        attributes: { brand: 'L’Oréal', volumeMl: '1500ml', mrp: 2100 },
      },
      {
        productId: 'SLN-FACIAL-KIT',
        productName: 'O3+ Bridal Glow Oxygen Facial Single Kit (Box of 5)',
        category: 'Facial & Skin Care',
        stockOnHand: 6,
        reorderLevel: 4,
        supplierLeadDays: 3,
        unitCost: 1850,
        retailPrice: 2850,
        attributes: { brand: 'O3+', volumeMl: '5 Treatments', mrp: 3100 },
      },
      {
        productId: 'SLN-HAIR-COLOR',
        productName: 'Matrix SoColor Permanent Cream Color 60g (Dark Brown)',
        category: 'Hair Color & Bleach',
        stockOnHand: 14,
        reorderLevel: 8,
        supplierLeadDays: 2,
        unitCost: 160,
        retailPrice: 240,
        attributes: { brand: 'Matrix', volumeMl: '60g Tube', mrp: 260 },
      },
      {
        productId: 'SLN-BLEACH-CR',
        productName: 'OxyGlow Diamond Bleach Cream 1000g Salon Pack',
        category: 'Facial & Skin Care',
        stockOnHand: 4,
        reorderLevel: 3,
        supplierLeadDays: 3,
        unitCost: 550,
        retailPrice: 850,
        attributes: { brand: 'OxyGlow', volumeMl: '1000g Tub', mrp: 950 },
      },
      {
        productId: 'SLN-WAX-TIN',
        productName: 'Rica White Chocolate Liposoluble Wax 800ml',
        category: 'Depilatory & Wax',
        stockOnHand: 5,
        reorderLevel: 4,
        supplierLeadDays: 2,
        unitCost: 950,
        retailPrice: 1350,
        attributes: { brand: 'Rica', volumeMl: '800ml Tin', mrp: 1450 },
      },
      {
        productId: 'SLN-HAIR-SPA',
        productName: 'L’Oréal Hair Spa Deep Nourishing Creambath 500g',
        category: 'Hair Care Backbar',
        stockOnHand: 8,
        reorderLevel: 5,
        supplierLeadDays: 3,
        unitCost: 480,
        retailPrice: 750,
        attributes: { brand: 'L’Oréal', volumeMl: '500g Tub', mrp: 825 },
      },
      {
        productId: 'SLN-SERUM-100',
        productName: 'Streax Professional Vitariche Gloss Hair Serum 100ml',
        category: 'Retail & Styling',
        stockOnHand: 16,
        reorderLevel: 8,
        supplierLeadDays: 2,
        unitCost: 210,
        retailPrice: 325,
        attributes: { brand: 'Streax', volumeMl: '100ml Pump', mrp: 350 },
      },
      {
        productId: 'SLN-PEDICURE-KT',
        productName: 'Sara Soul of Beauty Manicure & Pedicure Spa Kit 600g',
        category: 'Mani & Pedi Care',
        stockOnHand: 7,
        reorderLevel: 4,
        supplierLeadDays: 3,
        unitCost: 650,
        retailPrice: 1100,
        attributes: { brand: 'Sara Beauty', volumeMl: '600g Kit', mrp: 1250 },
      },
      {
        productId: 'SLN-MASSAGE-OIL',
        productName: 'Aroma Magic Jasmine Cold-Pressed Body Massage Oil 1L',
        category: 'Body & Spa',
        stockOnHand: 12, // Slow moving dead stock candidate
        reorderLevel: 4,
        supplierLeadDays: 4,
        unitCost: 520,
        retailPrice: 850,
        attributes: { brand: 'Aroma Magic', volumeMl: '1000ml Bottle', mrp: 950 },
      },
      {
        productId: 'SLN-FOIL-ROLL',
        productName: 'Professional Aluminium Hair Highlighting Foil Roll 100m',
        category: 'Accessories & Tools',
        stockOnHand: 6,
        reorderLevel: 3,
        supplierLeadDays: 2,
        unitCost: 280,
        retailPrice: 420,
        attributes: { brand: 'Vega Pro', volumeMl: '100m Roll', mrp: 450 },
      },
      {
        productId: 'SLN-KERATIN-TR',
        productName: 'GK Hair The Best Keratin Treatment 300ml',
        category: 'Hair Care Backbar',
        stockOnHand: 2,
        reorderLevel: 2,
        supplierLeadDays: 5,
        unitCost: 4200,
        retailPrice: 6500,
        attributes: { brand: 'GK Hair', volumeMl: '300ml Bottle', mrp: 7200 },
      },
      {
        productId: 'SLN-DISP-SHEET',
        productName: 'Disposable Non-Woven Spa Bed Sheets (Pack of 50)',
        category: 'Hygiene Disposables',
        stockOnHand: 20,
        reorderLevel: 10,
        supplierLeadDays: 2,
        unitCost: 320,
        retailPrice: 480,
        attributes: { brand: 'EcoPro', volumeMl: 'Pack of 50', mrp: 550 },
      },
    ];

    const sales: SalesRecord[] = [];
    const today = new Date('2026-10-30T00:00:00');
    for (let i = 14; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      sales.push({ date: dateStr, productId: 'SLN-SHAMP-1L', productName: 'L’Oréal Professionnel Mythic Oil Shampoo 1.5L', category: 'Hair Care Backbar', unitsSold: 2, unitPrice: 1950 }); // fast mover -> stockout
      sales.push({ date: dateStr, productId: 'SLN-FACIAL-KIT', productName: 'O3+ Bridal Glow Oxygen Facial Single Kit (Box of 5)', category: 'Facial & Skin Care', unitsSold: 1, unitPrice: 2850 });
      sales.push({ date: dateStr, productId: 'SLN-HAIR-COLOR', productName: 'Matrix SoColor Permanent Cream Color 60g (Dark Brown)', category: 'Hair Color & Bleach', unitsSold: 3, unitPrice: 240 });
      sales.push({ date: dateStr, productId: 'SLN-BLEACH-CR', productName: 'OxyGlow Diamond Bleach Cream 1000g Salon Pack', category: 'Facial & Skin Care', unitsSold: 1, unitPrice: 850 });
      sales.push({ date: dateStr, productId: 'SLN-WAX-TIN', productName: 'Rica White Chocolate Liposoluble Wax 800ml', category: 'Depilatory & Wax', unitsSold: 2, unitPrice: 1350 });
      sales.push({ date: dateStr, productId: 'SLN-HAIR-SPA', productName: 'L’Oréal Hair Spa Deep Nourishing Creambath 500g', category: 'Hair Care Backbar', unitsSold: 1, unitPrice: 750 });
      sales.push({ date: dateStr, productId: 'SLN-SERUM-100', productName: 'Streax Professional Vitariche Gloss Hair Serum 100ml', category: 'Retail & Styling', unitsSold: 2, unitPrice: 325 });
      sales.push({ date: dateStr, productId: 'SLN-PEDICURE-KT', productName: 'Sara Soul of Beauty Manicure & Pedicure Spa Kit 600g', category: 'Mani & Pedi Care', unitsSold: 1, unitPrice: 1100 });
      sales.push({ date: dateStr, productId: 'SLN-MASSAGE-OIL', productName: 'Aroma Magic Jasmine Cold-Pressed Body Massage Oil 1L', category: 'Body & Spa', unitsSold: 0, unitPrice: 850 }); // idle dead stock
      sales.push({ date: dateStr, productId: 'SLN-FOIL-ROLL', productName: 'Professional Aluminium Hair Highlighting Foil Roll 100m', category: 'Accessories & Tools', unitsSold: 1, unitPrice: 420 });
      sales.push({ date: dateStr, productId: 'SLN-KERATIN-TR', productName: 'GK Hair The Best Keratin Treatment 300ml', category: 'Hair Care Backbar', unitsSold: 1, unitPrice: 6500 });
      sales.push({ date: dateStr, productId: 'SLN-DISP-SHEET', productName: 'Disposable Non-Woven Spa Bed Sheets (Pack of 50)', category: 'Hygiene Disposables', unitsSold: 2, unitPrice: 480 });
    }

    return {
      store: {
        name: 'Royal Care Salon & Spa',
        type: 'Hair Salon, Beauty Parlor & Spa',
        location: '5th Block, Koramangala, Bengaluru',
      },
      products,
      sales,
    };
  },
};
