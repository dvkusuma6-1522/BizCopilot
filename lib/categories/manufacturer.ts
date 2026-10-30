import { CategoryConfig } from './types';
import { InventoryItem, SalesRecord } from '@/lib/types';

export const manufacturerCategory: CategoryConfig = {
  id: 'manufacturer',
  icon: 'Cog',
  labels: {
    en: 'Small Manufacturer & Workshop',
    kn: 'ಸಣ್ಣ ಕೈಗಾರಿಕೆ & ಕಾರ್ಯಾಗಾರ (Manufacturer)',
    hi: 'लघु उद्योग एवं वर्कशॉप (Manufacturer)',
  },
  description: {
    en: 'Small factories, job work units, CNC workshops, assembly units, and component makers',
    kn: 'ಸಣ್ಣ ಕಾರ್ಖಾನೆಗಳು, ಜಾಬ್ ವರ್ಕ್ ಯುನಿಟ್‌ಗಳು, ಸಿಎನ್‌ಸಿ ವರ್ಕ್‌ಶಾಪ್ ಮತ್ತು ಉತ್ಪಾದನಾ ಘಟಕಗಳು',
    hi: 'लघु कारखाने, जॉब वर्क यूनिट, सीएनसी वर्कशॉप, फैब्रिकेशन और असेंबली यूनिट्स',
  },
  defaultBufferDays: 14,
  defaultLeadDays: 7,
  productFields: [
    {
      key: 'itemStage',
      label: { en: 'Material Type', kn: 'ಸಾಮಗ್ರಿ ಹಂತ', hi: 'सामग्री का प्रकार' },
      type: 'select',
      options: ['Raw Material', 'Work in Progress (WIP)', 'Finished Good', 'Consumable'],
      isGridColumn: true,
      format: (v) => String(v || 'Raw Material'),
    },
    {
      key: 'unitType',
      label: { en: 'Unit', kn: 'ಯೂನಿಟ್', hi: 'इकाई' },
      type: 'select',
      options: ['Kg', 'Pieces', 'Meters', 'Liters', 'Sets'],
      isGridColumn: true,
      format: (v) => String(v || 'Pieces'),
    },
  ],
  terms: {
    stock: { en: 'Raw Materials & Finished Goods', kn: 'ಕಚ್ಚಾ ಸಾಮಗ್ರಿ & ಸಿದ್ಧ ವಸ್ತುಗಳು', hi: 'कच्चा माल एवं तैयार उत्पाद' },
    supplier: { en: 'Raw Material Vendor / Mill', kn: 'ಕಚ್ಚಾ ಸಾಮಗ್ರಿ ಸರಬರಾಜುದಾರರು', hi: 'कच्चा माल सप्लायर' },
    leadTime: { en: 'Procurement Transit Days', kn: 'ಖರೀದಿ ಸಾಗಣೆ ದಿನಗಳು', hi: 'कच्चा माल आने के दिन' },
    itemUnit: { en: 'kg / meters / pcs', kn: 'ಕೆ.ಜಿ / ಮೀಟರ್ / ಪೀಸ್', hi: 'किग्रा / मीटर / पीस' },
    reorderAction: { en: 'Issue Vendor Purchase Order', kn: 'ವೆಂಡರ್‌ಗೆ ಪಿ.ಓ ಕಳುಹಿಸಿ', hi: 'सप्लायर को पीओ जारी करें' },
  },
  alertRules: [
    {
      id: 'mfg_bottleneck_stockout',
      priority: 'critical',
      evaluate: ({ inventory }) => {
        return inventory
          .filter((i) => i.isStockoutRisk && i.attributes?.itemStage === 'Raw Material')
          .map((item) => ({
            triggered: true,
            productId: item.productId,
            productName: item.productName,
            headline: {
              en: `Production stoppage risk: ${item.productName}`,
              kn: `ಉತ್ಪಾದನೆ ಸ್ಥಗಿತಗೊಳ್ಳುವ ಅಪಾಯ: ${item.productName}`,
              hi: `उत्पादन रुकने का खतरा: ${item.productName}`,
            },
            explanation: {
              en: `Raw material stock (${item.stockOnHand}) will exhaust in ${item.daysOfCover} days. Vendor procurement lead time is ${item.supplierLeadDays} days.`,
              kn: `ಕಚ್ಚಾ ಸಾಮಗ್ರಿ ದಾಸ್ತಾನು ಕೇವಲ ${item.daysOfCover} ದಿನಗಳಲ್ಲಿ ಮುಗಿಯಲಿದೆ (ಪೂರೈಕೆಗೆ ${item.supplierLeadDays} ದಿನ ಬೇಕು). ಕಾರ್ಖಾನೆ ಕೆಲಸ ನಿಲ್ಲಬಹುದು.`,
              hi: `कच्चा माल केवल ${item.daysOfCover} दिन में खत्म हो जाएगा (सप्लायर समय ${item.supplierLeadDays} दिन)। काम रुक सकता है।`,
            },
            supportingData: `Stock: ${item.stockOnHand} | Daily Machine Use: ~${item.avgDailySales} | Lead: ${item.supplierLeadDays}d`,
            suggestedAction: {
              en: `Issue PO for ${item.recommendedReorderQty} units to prevent factory downtime.`,
              kn: `ಕಾರ್ಖಾನೆ ಕೆಲಸ ನಿಲ್ಲದಂತೆ ಇಂದೇ ${item.recommendedReorderQty} ಯೂನಿಟ್‌ಗಳ ಖರೀದಿ ಆರ್ಡರ್ ನೀಡಿ.`,
              hi: `मशीनें बंद होने से बचाने के लिए तुरंत ${item.recommendedReorderQty} यूनिट्स का पीओ जारी करें।`,
            },
            impactValue: item.recommendedReorderQty * item.retailPrice,
            section: 'today',
          }));
      },
    },
  ],
  kpis: [
    {
      id: 'mfg_bottleneck_raw_materials',
      label: { en: 'Bottleneck Raw Materials', kn: 'ಕೊರತೆಯಿರುವ ಕಚ್ಚಾ ಸಾಮಗ್ರಿಗಳು', hi: 'कम स्टॉक वाले कच्चे माल' },
      tooltip: { en: 'Raw material items below vendor lead buffer', kn: 'ಪೂರೈಕೆ ಸಮಯಕ್ಕಿಂತ ಕಡಿಮೆ ದಾಸ್ತಾನು ಇರುವ ಕಚ್ಚಾ ಸಾಮಗ್ರಿಗಳು', hi: 'कच्चे माल जो जल्द खत्म होकर काम रोक सकते हैं' },
      compute: ({ inventory }) => {
        const count = inventory.filter(
          (i) => i.isStockoutRisk && i.attributes?.itemStage === 'Raw Material'
        ).length;
        return {
          value: `${count} Materials`,
          numericValue: count,
          status: count > 0 ? 'critical' : 'optimal',
          sublabel: count > 0 ? 'Production halt risk' : 'Assembly lines covered',
        };
      },
    },
  ],
  seasonality: [
    {
      id: 'fiscal_year_end_rush',
      name: { en: 'Fiscal Year-End Industrial Rush', kn: 'ಆರ್ಥಿಕ ವರ್ಷಾಂತ್ಯದ ಬೇಡಿಕೆ', hi: 'वित्तीय वर्ष समाप्ति ऑर्डर' },
      startMonth: 2,
      startDay: 15,
      endMonth: 3,
      endDay: 31,
      multiplier: 1.35,
      rationale: { en: 'Industrial buyers exhaust annual budgets leading to +35% component demand surge in Feb-March.', kn: 'ಫೆಬ್ರವರಿ-ಮಾರ್ಚ್‌ನಲ್ಲಿ ಬಜೆಟ್ ಮುಕ್ತಾಯದ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಕೈಗಾರಿಕಾ ಆರ್ಡರ್‌ಗಳು 35% ಹೆಚ್ಚಳ.', hi: 'फरवरी-मार्च में बजट खत्म करने के लिए औद्योगिक ऑर्डर्स में 35% की बढ़ोतरी।' },
    },
  ],
  whatsappTemplates: {
    order: (storeName, productName, qty, _extra, lang = 'en') => {
      if (lang === 'kn') {
        return `ನಮಸ್ಕಾರ, ${storeName} ಕಾರ್ಖಾನೆಯಿಂದ. ನಮಗೆ ${productName} ನ ${qty} ಕಚ್ಚಾ ಸಾಮಗ್ರಿ ತುರ್ತಾಗಿ ಬೇಕಾಗಿದೆ. ದಯವಿಟ್ಟು ಡೆಸ್ಪ್ಯಾಚ್ ಖಚಿತಪಡಿಸಿ. ಧನ್ಯವಾದಗಳು!`;
      }
      if (lang === 'hi') {
        return `नमस्ते, ${storeName} वर्कशॉप से। हमें ${productName} के ${qty} रॉ मटेरियल की तत्काल आवश्यकता है। कृपया डिलीवरी कन्फर्म करें। धन्यवाद!`;
      }
      return `Hello from ${storeName}. Please confirm Purchase Order for ${qty} units of raw material ${productName}. Urgent dispatch requested. Thank you!`;
    },
    summary: (storeName, salesStr, riskCount) => {
      return `*${storeName} Workshop Production Update*\nDispatched Parts Revenue: ${salesStr}\nRaw Material Bottlenecks: ${riskCount}\nGenerated by BizCopilot.`;
    },
  },
  demoDataset: () => {
    const products: InventoryItem[] = [
      {
        productId: 'MFG-STEEL-ROD',
        productName: 'Bright Drawn Round Steel Rods 20mm (6m Bar)',
        category: 'Raw Materials',
        stockOnHand: 6, // Stockout candidate: velocity ~2 bars/day, lead 5d -> 3d cover
        reorderLevel: 15,
        supplierLeadDays: 5,
        unitCost: 1450,
        retailPrice: 2100,
        attributes: { itemStage: 'Raw Material', unitType: 'Pieces' },
      },
      {
        productId: 'MFG-BEAR-6204',
        productName: 'Deep Groove Radial Ball Bearing 6204 2RS',
        category: 'Sub-Assemblies',
        stockOnHand: 45,
        reorderLevel: 25,
        supplierLeadDays: 4,
        unitCost: 85,
        retailPrice: 145,
        attributes: { itemStage: 'Raw Material', unitType: 'Pieces' },
      },
      {
        productId: 'MFG-FAST-M8',
        productName: 'Grade 8.8 High Tensile Hex Bolts M8x40 (Box 100)',
        category: 'Fasteners & Hardware',
        stockOnHand: 18,
        reorderLevel: 10,
        supplierLeadDays: 3,
        unitCost: 320,
        retailPrice: 480,
        attributes: { itemStage: 'Raw Material', unitType: 'Pieces' },
      },
      {
        productId: 'MFG-CUT-OIL-20L',
        productName: 'Water Soluble CNC Coolant Cutting Oil 20L Can',
        category: 'Consumables & Tooling',
        stockOnHand: 5,
        reorderLevel: 4,
        supplierLeadDays: 3,
        unitCost: 3200,
        retailPrice: 4100,
        attributes: { itemStage: 'Consumable', unitType: 'Liters' },
      },
      {
        productId: 'MFG-FIN-BUSH',
        productName: 'Precision CNC Turned Bronze Flange Bushing',
        category: 'Finished Goods',
        stockOnHand: 120,
        reorderLevel: 50,
        supplierLeadDays: 2,
        unitCost: 140,
        retailPrice: 240,
        attributes: { itemStage: 'Finished Good', unitType: 'Pieces' },
      },
      {
        productId: 'MFG-ALU-6061',
        productName: 'Aluminum 6061 T6 Flat Billet 50x25mm (3m)',
        category: 'Raw Materials',
        stockOnHand: 10,
        reorderLevel: 8,
        supplierLeadDays: 6,
        unitCost: 2400,
        retailPrice: 3200,
        attributes: { itemStage: 'Raw Material', unitType: 'Pieces' },
      },
      {
        productId: 'MFG-INSRT-CNMG',
        productName: 'Sandvik CNMG 120408 Carbide Turning Inserts (10pk)',
        category: 'Consumables & Tooling',
        stockOnHand: 8,
        reorderLevel: 5,
        supplierLeadDays: 4,
        unitCost: 1850,
        retailPrice: 2650,
        attributes: { itemStage: 'Consumable', unitType: 'Sets' },
      },
      {
        productId: 'MFG-SS-SHAFT',
        productName: 'SS304 Ground Stepped Drive Shaft (Finished)',
        category: 'Finished Goods',
        stockOnHand: 35,
        reorderLevel: 20,
        supplierLeadDays: 3,
        unitCost: 480,
        retailPrice: 780,
        attributes: { itemStage: 'Finished Good', unitType: 'Pieces' },
      },
      {
        productId: 'MFG-CAST-HOUS',
        productName: 'Cast Iron Bearing Housing Rough Casting',
        category: 'Raw Materials',
        stockOnHand: 25,
        reorderLevel: 15,
        supplierLeadDays: 8,
        unitCost: 380,
        retailPrice: 620,
        attributes: { itemStage: 'Raw Material', unitType: 'Pieces' },
      },
      {
        productId: 'MFG-FIN-GEAR',
        productName: 'Spur Pinion Gear 24 Teeth Module 2 (Finished)',
        category: 'Finished Goods',
        stockOnHand: 50,
        reorderLevel: 25,
        supplierLeadDays: 2,
        unitCost: 310,
        retailPrice: 550,
        attributes: { itemStage: 'Finished Good', unitType: 'Pieces' },
      },
      {
        productId: 'MFG-HYD-SEAL',
        productName: 'Hydraulic Cylinder Polyurethane Piston Seal Kit',
        category: 'Fasteners & Hardware',
        stockOnHand: 28,
        reorderLevel: 12,
        supplierLeadDays: 3,
        unitCost: 260,
        retailPrice: 420,
        attributes: { itemStage: 'Raw Material', unitType: 'Sets' },
      },
      {
        productId: 'MFG-WELD-WIRE',
        productName: 'MIG Welding Wire ER70S-6 1.2mm (15kg Spool)',
        category: 'Consumables & Tooling',
        stockOnHand: 4,
        reorderLevel: 4,
        supplierLeadDays: 3,
        unitCost: 1950,
        retailPrice: 2500,
        attributes: { itemStage: 'Consumable', unitType: 'Pieces' },
      },
    ];

    const sales: SalesRecord[] = [];
    const today = new Date('2026-10-30T00:00:00');
    for (let i = 14; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      sales.push({ date: dateStr, productId: 'MFG-STEEL-ROD', productName: 'Bright Drawn Round Steel Rods 20mm (6m Bar)', category: 'Raw Materials', unitsSold: 2, unitPrice: 2100 }); // bottleneck usage
      sales.push({ date: dateStr, productId: 'MFG-BEAR-6204', productName: 'Deep Groove Radial Ball Bearing 6204 2RS', category: 'Sub-Assemblies', unitsSold: 5, unitPrice: 145 });
      sales.push({ date: dateStr, productId: 'MFG-FAST-M8', productName: 'Grade 8.8 High Tensile Hex Bolts M8x40 (Box 100)', category: 'Fasteners & Hardware', unitsSold: 2, unitPrice: 480 });
      sales.push({ date: dateStr, productId: 'MFG-CUT-OIL-20L', productName: 'Water Soluble CNC Coolant Cutting Oil 20L Can', category: 'Consumables & Tooling', unitsSold: 1, unitPrice: 4100 });
      sales.push({ date: dateStr, productId: 'MFG-FIN-BUSH', productName: 'Precision CNC Turned Bronze Flange Bushing', category: 'Finished Goods', unitsSold: 15, unitPrice: 240 });
      sales.push({ date: dateStr, productId: 'MFG-ALU-6061', productName: 'Aluminum 6061 T6 Flat Billet 50x25mm (3m)', category: 'Raw Materials', unitsSold: 1, unitPrice: 3200 });
      sales.push({ date: dateStr, productId: 'MFG-INSRT-CNMG', productName: 'Sandvik CNMG 120408 Carbide Turning Inserts (10pk)', category: 'Consumables & Tooling', unitsSold: 1, unitPrice: 2650 });
      sales.push({ date: dateStr, productId: 'MFG-SS-SHAFT', productName: 'SS304 Ground Stepped Drive Shaft (Finished)', category: 'Finished Goods', unitsSold: 4, unitPrice: 780 });
      sales.push({ date: dateStr, productId: 'MFG-CAST-HOUS', productName: 'Cast Iron Bearing Housing Rough Casting', category: 'Raw Materials', unitsSold: 3, unitPrice: 620 });
      sales.push({ date: dateStr, productId: 'MFG-FIN-GEAR', productName: 'Spur Pinion Gear 24 Teeth Module 2 (Finished)', category: 'Finished Goods', unitsSold: 6, unitPrice: 550 });
      sales.push({ date: dateStr, productId: 'MFG-HYD-SEAL', productName: 'Hydraulic Cylinder Polyurethane Piston Seal Kit', category: 'Fasteners & Hardware', unitsSold: 2, unitPrice: 420 });
      sales.push({ date: dateStr, productId: 'MFG-WELD-WIRE', productName: 'MIG Welding Wire ER70S-6 1.2mm (15kg Spool)', category: 'Consumables & Tooling', unitsSold: 1, unitPrice: 2500 });
    }

    return {
      store: {
        name: 'Precision Auto Parts & Small Mfg',
        type: 'CNC Machining, Turned Parts & Assembly',
        location: 'Peenya 2nd Stage, Industrial Area, Bengaluru',
      },
      products,
      sales,
    };
  },
};
