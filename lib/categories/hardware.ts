import { CategoryConfig } from './types';
import { InventoryItem, SalesRecord } from '@/lib/types';

export const hardwareCategory: CategoryConfig = {
  id: 'hardware',
  icon: 'Wrench',
  labels: {
    en: 'Hardware & Electricals',
    kn: 'ಹಾರ್ಡ್‌ವೇರ್ & ಎಲೆಕ್ಟ್ರಿಕಲ್ಸ್ (Hardware)',
    hi: 'हार्डवेयर एवं इलेक्ट्रिकल्स (Hardware)',
  },
  description: {
    en: 'Hardware stores, electrical shops, sanitaryware, paints, and building materials',
    kn: 'ಹಾರ್ಡ್‌ವೇರ್ ಮಳಿಗೆಗಳು, ಎಲೆಕ್ಟ್ರಿಕಲ್ ಅಂಗಡಿ, ಸ್ಯಾನಿಟರಿ ಮತ್ತು ಪೇಂಟ್ ಡೀಲರ್‌ಗಳು',
    hi: 'हार्डवेयर स्टोर, बिजली की दुकान, प्लंबिंग, पेंट और बिल्डिंग मटेरियल',
  },
  defaultBufferDays: 14,
  defaultLeadDays: 5,
  productFields: [
    {
      key: 'brand',
      label: { en: 'Brand / Make', kn: 'ಬ್ರ್ಯಾಂಡ್ / ಕಂಪನಿ', hi: 'ब्रांड / कंपनी' },
      type: 'text',
      isGridColumn: true,
      format: (v) => String(v || '-'),
    },
    {
      key: 'packSize',
      label: { en: 'Pack / Length', kn: 'ಪ್ಯಾಕ್ ಗಾತ್ರ / ಉದ್ದ', hi: 'पैक साइज़ / लंबाई' },
      type: 'text',
      isGridColumn: true,
      format: (v) => String(v || '-'),
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
    stock: { en: 'Stock in Bins & Racks', kn: 'ಬಿನ್‌ಗಳಲ್ಲಿರುವ ಸರಕು', hi: 'रैक और बिन में उपलब्ध सामान' },
    supplier: { en: 'Agency / Depot Distributor', kn: 'ಏಜೆನ್ಸಿ / ಡಿಪೋ ವಿತರಕರು', hi: 'एजेंसी / कंपनी डिपो' },
    leadTime: { en: 'Depot Supply Days', kn: 'ಡಿಪೋ ಪೂರೈಕೆ ಸಮಯ', hi: 'डिपो से माल आने के दिन' },
    itemUnit: { en: 'pieces / boxes / meters', kn: 'ಪೀಸ್ / ಬಾಕ್ಸ್ / ಮೀಟರ್', hi: 'पीस / बॉक्स / मीटर' },
    reorderAction: { en: 'Order from Depot', kn: 'ಡಿಪೋಗೆ ಇಂಡೆಂಟ್ ನೀಡಿ', hi: 'डिपो को ऑर्डर भेजें' },
  },
  alertRules: [
    {
      id: 'hardware_slow_capital',
      priority: 'warning',
      evaluate: ({ inventory }) => {
        return inventory
          .filter((i) => i.isDeadStock)
          .map((item) => ({
            triggered: true,
            productId: item.productId,
            productName: item.productName,
            headline: {
              en: `Heavy capital tied up in ${item.productName}`,
              kn: `${item.productName} ನಲ್ಲಿ ಸಿಲುಕಿರುವ ಬೃಹತ್ ಬಂಡವಾಳ`,
              hi: `${item.productName} में फंसी हुई बड़ी पूंजी`,
            },
            explanation: {
              en: `${item.stockOnHand} units sitting in racks with ₹${item.deadStockValue.toLocaleString('en-IN')} locked up.`,
              kn: `ರ್ಯಾಕ್‌ನಲ್ಲಿ ${item.stockOnHand} ಯೂನಿಟ್‌ಗಳು ಬಾಕಿ ಉಳಿದಿದ್ದು ₹${item.deadStockValue.toLocaleString('en-IN')} ಬಂಡವಾಳ ಸಿಲುಕಿದೆ.`,
              hi: `रैक में ${item.stockOnHand} यूनिट्स बिना बिके पड़े हैं और ₹${item.deadStockValue.toLocaleString('en-IN')} की पूंजी फंसी है।`,
            },
            supportingData: `Stock: ${item.stockOnHand} | Cost Value: ₹${item.deadStockValue.toLocaleString('en-IN')}`,
            suggestedAction: {
              en: 'Offer 10% discount to local civil contractors or return excess to depot.',
              kn: 'ಸಿವಿಲ್ ಕಾಂಟ್ರಾಕ್ಟರ್‌ಗಳಿಗೆ 10% ರಿಯಾಯಿತಿ ನೀಡಿ ಅಥವಾ ಡಿಪೋಗೆ ವಾಪಸ್ ಮಾಡಿ.',
              hi: 'स्थानीय ठेकेदारों को 10% छूट देकर या डिपो को वापस करके नकदी निकालें।',
            },
            impactValue: item.deadStockValue,
            section: 'week',
          }));
      },
    },
    {
      id: 'hardware_contractor_stockout',
      priority: 'critical',
      evaluate: ({ inventory }) => {
        return inventory
          .filter((i) => i.isStockoutRisk)
          .map((item) => ({
            triggered: true,
            productId: item.productId,
            productName: item.productName,
            headline: {
              en: `Contractor favorite ${item.productName} running out`,
              kn: `${item.productName} ದಾಸ್ತಾನು ಖಾಲಿಯಾಗುತ್ತಿದೆ`,
              hi: `ठेकेदारों का पसंदीदा ${item.productName} खत्म होने वाला है`,
            },
            explanation: {
              en: `Only ${item.daysOfCover} days of stock left. Depot transit requires ${item.supplierLeadDays} days.`,
              kn: `ಕೇವಲ ${item.daysOfCover} ದಿನಗಳ ದಾಸ್ತಾನು ಉಳಿದಿದೆ. ಡಿಪೋದಿಂದ ಬರಲು ${item.supplierLeadDays} ದಿನ ಬೇಕು.`,
              hi: `केवल ${item.daysOfCover} दिन का स्टॉक बाकी है। डिपो से आने में ${item.supplierLeadDays} दिन लगते हैं।`,
            },
            supportingData: `Stock: ${item.stockOnHand} | Velocity: ~${item.avgDailySales}/day | Lead: ${item.supplierLeadDays}d`,
            suggestedAction: {
              en: `Order ${item.recommendedReorderQty} units from regional depot now.`,
              kn: `ಡಿಪೋದಿಂದ ತಕ್ಷಣವೇ ${item.recommendedReorderQty} ಯೂನಿಟ್‌ಗಳನ್ನು ಬುಕ್ ಮಾಡಿ.`,
              hi: `डिपो से तुरंत ${item.recommendedReorderQty} यूनिट्स का ऑर्डर बुक करें।`,
            },
            impactValue: item.recommendedReorderQty * item.retailPrice,
            section: 'today',
          }));
      },
    },
  ],
  kpis: [
    {
      id: 'hardware_slow_stock_share',
      label: { en: 'Slow Capital Locked', kn: 'ನಿಷ್ಕ್ರಿಯ ಸರಕಿನಲ್ಲಿ ಸಿಲುಕಿರುವ ಹಣ', hi: 'रुके हुए सामान की पूंजी' },
      tooltip: { en: 'Total wholesale value locked in hardware items with low turnover', kn: 'ಕಡಿಮೆ ಮಾರಾಟವಾಗುವ ಹಾರ್ಡ್‌ವೇರ್ ವಸ್ತುಗಳಲ್ಲಿ ಸಿಲುಕಿರುವ ಹಣ', hi: 'धीमी बिक्री वाले हार्डवेयर में फंसी हुई कुल पूंजी' },
      compute: ({ inventory }) => {
        const deadTotal = inventory
          .filter((i) => i.isDeadStock)
          .reduce((sum, i) => sum + i.deadStockValue, 0);
        return {
          value: `₹${deadTotal.toLocaleString('en-IN')}`,
          numericValue: deadTotal,
          status: deadTotal > 20000 ? 'warning' : 'optimal',
          sublabel: deadTotal > 0 ? 'Contractor deals recommended' : 'Lean inventory',
        };
      },
    },
    {
      id: 'hardware_stockouts_count',
      label: { en: 'Urgent Depot Orders', kn: 'ತುರ್ತು ಡಿಪೋ ಆರ್ಡರ್‌ಗಳು', hi: 'तत्काल डिपो ऑर्डर' },
      tooltip: { en: 'Items running out before next truck dispatch', kn: 'ಮುಂದಿನ ಲೋಡ್ ಬರುವ ಮುನ್ನ ಖಾಲಿಯಾಗುವ ಸಾಮಗ್ರಿಗಳು', hi: 'सामान जो अगली सप्लाई से पहले खत्म हो जाएंगे' },
      compute: ({ inventory }) => {
        const count = inventory.filter((i) => i.isStockoutRisk).length;
        return {
          value: `${count} Items`,
          numericValue: count,
          status: count > 0 ? 'critical' : 'optimal',
          sublabel: count > 0 ? 'Truck dispatch required' : 'Bins fully stocked',
        };
      },
    },
  ],
  seasonality: [
    {
      id: 'pre_monsoon_painting',
      name: { en: 'Pre-Monsoon Waterproofing & Painting', kn: 'ಮಳೆಗಾಲ ಪೂರ್ವ ವಾಟರ್‌ಪ್ರೂಫಿಂಗ್', hi: 'मानसून पूर्व वॉटरप्रूफिंग व पेंट' },
      startMonth: 4,
      startDay: 15,
      endMonth: 6,
      endDay: 10,
      multiplier: 1.4,
      rationale: { en: 'Waterproofing chemical (Dr. Fixit), exterior emulsion paints, and roof repair surge +40%.', kn: 'ಡಾ.ಫಿಕ್ಸಿಟ್, ಎಮಲ್ಷನ್ ಪೇಂಟ್ ಮತ್ತು ರೂಫ್ ರಿಪೇರಿ ಸಾಮಗ್ರಿಗಳ ಬೇಡಿಕೆ 40% ಹೆಚ್ಚಳ.', hi: 'वॉटरप्रूफिंग केमिकल और पेंट की मांग 40% उछलती है।' },
    },
  ],
  whatsappTemplates: {
    order: (storeName, productName, qty, _extra, lang = 'en') => {
      if (lang === 'kn') {
        return `ನಮಸ್ಕಾರ, ${storeName} ಹಾರ್ಡ್‌ವೇರ್‌ನಿಂದ. ನಮಗೆ ${productName} ನ ${qty} ಯೂನಿಟ್‌ಗಳು ಬೇಕಾಗಿದೆ. ದಯವಿಟ್ಟು ಮುಂದಿನ ಡಿಪೋ ಗಾಡಿಯಲ್ಲಿ ಕಳುಹಿಸಿ. ಧನ್ಯವಾದಗಳು!`;
      }
      if (lang === 'hi') {
        return `नमस्ते, ${storeName} हार्डवेयर से। हमें ${productName} के ${qty} यूनिट्स की आवश्यकता है। कृपया डिपो की अगली गाड़ी में भिजवाएं। धन्यवाद!`;
      }
      return `Hello from ${storeName}. Please bill order for ${qty} units of ${productName} on the next depot transport vehicle. Thank you!`;
    },
    summary: (storeName, salesStr, riskCount, lang = 'en') => {
      if (lang === 'kn') {
        return `*${storeName} ಹಾರ್ಡ್‌ವೇರ್ ವರದಿ*\nದೈನಂದಿನ ಮಾರಾಟ: ${salesStr}\nತುರ್ತು ಆರ್ಡರ್ ಮಾಡಬೇಕಾದ ಸರಕು: ${riskCount}\nBizCopilot ಮೂಲಕ ಕಳುಹಿಸಲಾಗಿದೆ.`;
      }
      if (lang === 'hi') {
        return `*${storeName} हार्डवेयर दैनिक रिपोर्ट*\nदैनिक बिक्री: ${salesStr}\nडिपो से तत्काल ऑर्डर योग्य सामान: ${riskCount}\nBizCopilot द्वारा भेजा गया।`;
      }
      return `*${storeName} Hardware Store Update*\nTurnover: ${salesStr}\nDepot Reorder Risks: ${riskCount}\nGenerated by BizCopilot.`;
    },
  },
  demoDataset: () => {
    const products: InventoryItem[] = [
      {
        productId: 'HDW-PAINT-20L',
        productName: 'Asian Paints Apex Exterior White 20L',
        category: 'Paints & Primers',
        stockOnHand: 4,
        reorderLevel: 5,
        supplierLeadDays: 4,
        unitCost: 3800,
        retailPrice: 4700,
        attributes: { brand: 'Asian Paints', packSize: '20L Bucket', mrp: 4950 },
      },
      {
        productId: 'HDW-LED-9W',
        productName: 'Philips Cool Day White LED Bulb 9W (Pack of 10)',
        category: 'Electricals & Lighting',
        stockOnHand: 6, // Stockout risk: velocity ~3 packs/day, 6 on hand, lead 4d -> 2d cover!
        reorderLevel: 15,
        supplierLeadDays: 4,
        unitCost: 650,
        retailPrice: 900,
        attributes: { brand: 'Philips', packSize: 'Box of 10', mrp: 990 },
      },
      {
        productId: 'HDW-PVC-PIPE-4',
        productName: 'Supreme PVC SWR Pipe 4 Inch 10ft',
        category: 'Plumbing & Pipes',
        stockOnHand: 22,
        reorderLevel: 15,
        supplierLeadDays: 3,
        unitCost: 420,
        retailPrice: 580,
        attributes: { brand: 'Supreme', packSize: '10 Feet Length', mrp: 620 },
      },
      {
        productId: 'HDW-DR-FIXIT',
        productName: 'Dr. Fixit Pidiproof LW+ 5L',
        category: 'Waterproofing Chemicals',
        stockOnHand: 14,
        reorderLevel: 10,
        supplierLeadDays: 3,
        unitCost: 620,
        retailPrice: 820,
        attributes: { brand: 'Pidilite', packSize: '5L Can', mrp: 880 },
      },
      {
        productId: 'HDW-MCB-32A',
        productName: 'Schneider Acti9 Double Pole MCB 32A',
        category: 'Switchgear & Safety',
        stockOnHand: 18,
        reorderLevel: 10,
        supplierLeadDays: 4,
        unitCost: 440,
        retailPrice: 620,
        attributes: { brand: 'Schneider Electric', packSize: 'Single Unit', mrp: 680 },
      },
      {
        productId: 'HDW-BRASS-HINGE',
        productName: 'Heavy Brass Door Hinges 5x3 Inch (Pair)',
        category: 'Hardware & Fittings',
        stockOnHand: 35, // Slow-moving dead capital candidate
        reorderLevel: 10,
        supplierLeadDays: 5,
        unitCost: 280,
        retailPrice: 420,
        attributes: { brand: 'Archis', packSize: 'Pair with Screws', mrp: 450 },
      },
      {
        productId: 'HDW-CEMENT-50K',
        productName: 'UltraTech Super Cement 50kg Bag',
        category: 'Building Materials',
        stockOnHand: 40,
        reorderLevel: 30,
        supplierLeadDays: 2,
        unitCost: 375,
        retailPrice: 420,
        attributes: { brand: 'UltraTech', packSize: '50kg Bag', mrp: 430 },
      },
      {
        productId: 'HDW-TAP-BRASS',
        productName: 'Jaquar Continental Brass Bib Cock Tap',
        category: 'Sanitaryware',
        stockOnHand: 12,
        reorderLevel: 8,
        supplierLeadDays: 4,
        unitCost: 720,
        retailPrice: 990,
        attributes: { brand: 'Jaquar', packSize: 'Single Box', mrp: 1080 },
      },
      {
        productId: 'HDW-WIRE-1.5',
        productName: 'Finolex FR PVC Copper Wire 1.5 sq mm 90m',
        category: 'Electricals & Lighting',
        stockOnHand: 15,
        reorderLevel: 10,
        supplierLeadDays: 3,
        unitCost: 1450,
        retailPrice: 1850,
        attributes: { brand: 'Finolex', packSize: '90m Coil', mrp: 1980 },
      },
      {
        productId: 'HDW-DRILL-KIT',
        productName: 'Bosch GSB 500W Impact Drill Kit with Accessories',
        category: 'Power Tools',
        stockOnHand: 4,
        reorderLevel: 3,
        supplierLeadDays: 5,
        unitCost: 2600,
        retailPrice: 3499,
        attributes: { brand: 'Bosch', packSize: 'Carrying Case Kit', mrp: 3899 },
      },
      {
        productId: 'HDW-FEVICOL-SH',
        productName: 'Fevicol SH Wood Adhesive 5kg Bucket',
        category: 'Adhesives & Sealants',
        stockOnHand: 8,
        reorderLevel: 6,
        supplierLeadDays: 2,
        unitCost: 920,
        retailPrice: 1180,
        attributes: { brand: 'Pidilite', packSize: '5kg Bucket', mrp: 1250 },
      },
      {
        productId: 'HDW-SS-SCREW-BOX',
        productName: 'Stainless Steel Wood Screws 1.5 Inch (Box of 500)',
        category: 'Fasteners',
        stockOnHand: 25,
        reorderLevel: 12,
        supplierLeadDays: 3,
        unitCost: 210,
        retailPrice: 320,
        attributes: { brand: 'Kundal', packSize: 'Box 500 Pcs', mrp: 350 },
      },
    ];

    const sales: SalesRecord[] = [];
    const today = new Date('2026-10-30T00:00:00');
    for (let i = 14; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      sales.push({ date: dateStr, productId: 'HDW-PAINT-20L', productName: 'Asian Paints Apex Exterior White 20L', category: 'Paints & Primers', unitsSold: 1, unitPrice: 4700 });
      sales.push({ date: dateStr, productId: 'HDW-LED-9W', productName: 'Philips Cool Day White LED Bulb 9W (Pack of 10)', category: 'Electricals & Lighting', unitsSold: 3, unitPrice: 900 }); // fast mover -> stockout
      sales.push({ date: dateStr, productId: 'HDW-PVC-PIPE-4', productName: 'Supreme PVC SWR Pipe 4 Inch 10ft', category: 'Plumbing & Pipes', unitsSold: 4, unitPrice: 580 });
      sales.push({ date: dateStr, productId: 'HDW-DR-FIXIT', productName: 'Dr. Fixit Pidiproof LW+ 5L', category: 'Waterproofing Chemicals', unitsSold: 2, unitPrice: 820 });
      sales.push({ date: dateStr, productId: 'HDW-MCB-32A', productName: 'Schneider Acti9 Double Pole MCB 32A', category: 'Switchgear & Safety', unitsSold: 2, unitPrice: 620 });
      sales.push({ date: dateStr, productId: 'HDW-BRASS-HINGE', productName: 'Heavy Brass Door Hinges 5x3 Inch (Pair)', category: 'Hardware & Fittings', unitsSold: 0, unitPrice: 420 }); // idle dead stock
      sales.push({ date: dateStr, productId: 'HDW-CEMENT-50K', productName: 'UltraTech Super Cement 50kg Bag', category: 'Building Materials', unitsSold: 8, unitPrice: 420 });
      sales.push({ date: dateStr, productId: 'HDW-TAP-BRASS', productName: 'Jaquar Continental Brass Bib Cock Tap', category: 'Sanitaryware', unitsSold: 1, unitPrice: 990 });
      sales.push({ date: dateStr, productId: 'HDW-WIRE-1.5', productName: 'Finolex FR PVC Copper Wire 1.5 sq mm 90m', category: 'Electricals & Lighting', unitsSold: 2, unitPrice: 1850 });
      sales.push({ date: dateStr, productId: 'HDW-DRILL-KIT', productName: 'Bosch GSB 500W Impact Drill Kit with Accessories', category: 'Power Tools', unitsSold: 1, unitPrice: 3499 });
      sales.push({ date: dateStr, productId: 'HDW-FEVICOL-SH', productName: 'Fevicol SH Wood Adhesive 5kg Bucket', category: 'Adhesives & Sealants', unitsSold: 1, unitPrice: 1180 });
      sales.push({ date: dateStr, productId: 'HDW-SS-SCREW-BOX', productName: 'Stainless Steel Wood Screws 1.5 Inch (Box of 500)', category: 'Fasteners', unitsSold: 2, unitPrice: 320 });
    }

    return {
      store: {
        name: 'Sri Balaji Hardware & Electricals',
        type: 'Hardware, Paints & Electricals',
        location: 'Rajajinagar 1st Block, Bengaluru',
      },
      products,
      sales,
    };
  },
};
