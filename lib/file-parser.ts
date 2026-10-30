import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { InventoryItem, SalesRecord } from './types';
export { generateSampleCSVString } from './csv-parser';

export interface ParseResult {
  success: boolean;
  salesRecords: SalesRecord[];
  inventoryItems: InventoryItem[];
  hasInventoryData: boolean;
  totalRows: number;
  validRows: number;
  errors: string[];
  warnings: string[];
  detectedPreset?: string;
  mappedColumns?: Record<string, string>;
}

export type PresetType = 'standard' | 'vyapar' | 'tally' | 'zoho' | 'khatabook';

export const PRESET_DEFINITIONS: Record<
  PresetType,
  { name: string; description: string; sampleHeaders: string[] }
> = {
  standard: {
    name: 'Standard CSV / Excel',
    description: 'date, product_id, product_name, units_sold, unit_price, stock_on_hand',
    sampleHeaders: ['date', 'product_id', 'product_name', 'units_sold', 'unit_price', 'stock_on_hand'],
  },
  vyapar: {
    name: 'Vyapar App',
    description: 'Item Name, Item Code, Sale Price, Purchase Price, Stock Quantity',
    sampleHeaders: ['Date', 'Item Name', 'Item Code', 'Sale Qty', 'Sale Price', 'Stock Quantity', 'Purchase Price'],
  },
  tally: {
    name: 'Tally Prime / ERP',
    description: 'Date, Particulars, Part No, Billed Qty, Rate, Closing Balance',
    sampleHeaders: ['Date', 'Particulars', 'Part No', 'Billed Qty', 'Rate', 'Closing Balance'],
  },
  zoho: {
    name: 'Zoho Books / Inventory',
    description: 'Date, Item Name, SKU, Quantity Sold, Rate, Stock on Hand',
    sampleHeaders: ['Date', 'Item Name', 'SKU', 'Quantity Sold', 'Rate', 'Stock on Hand', 'Purchase Rate'],
  },
  khatabook: {
    name: 'Khatabook / myBillBook',
    description: 'Date, Item, Qty, Selling Price, Cost, Stock',
    sampleHeaders: ['Date', 'Item', 'Qty', 'Selling Price', 'Stock', 'Purchase Rate'],
  },
};

// Comprehensive multilingual and multi-accounting software fuzzy matcher
export function normalizeColumnHeader(header: string): string {
  const clean = header.trim().toLowerCase().replace(/[\s\-_.:/()]+/g, '');

  // Date
  if (
    [
      'date',
      'sale_date',
      'saledate',
      'invoicedate',
      'billdate',
      'txndate',
      'transactiondate',
      'ದಿನಾಂಕ',
      'तारीख',
      'दिनांक',
    ].includes(clean)
  ) {
    return 'date';
  }

  // Product ID / SKU
  if (
    [
      'productid',
      'itemid',
      'itemcode',
      'code',
      'sku',
      'partno',
      'partnumber',
      'barcode',
      'id',
      'pid',
      'ಕೋಡ್',
      'कोड',
    ].includes(clean)
  ) {
    return 'productId';
  }

  // Product Name
  if (
    [
      'productname',
      'itemname',
      'name',
      'particulars',
      'item',
      'product',
      'description',
      'title',
      'ಹೆಸರು',
      'नाम',
      'आइटम',
    ].includes(clean)
  ) {
    return 'productName';
  }

  // Category
  if (
    [
      'category',
      'itemcategory',
      'dept',
      'department',
      'group',
      'itemgroup',
      'ವರ್ಗ',
      'श्रेणी',
    ].includes(clean)
  ) {
    return 'category';
  }

  // Units Sold
  if (
    [
      'unitssold',
      'qty',
      'quantity',
      'units',
      'soldqty',
      'billedqty',
      'saleqty',
      'count',
      'sold',
      'ಪ್ರಮಾಣ',
      'मात्रा',
    ].includes(clean)
  ) {
    return 'unitsSold';
  }

  // Unit Price
  if (
    [
      'unitprice',
      'price',
      'sellingprice',
      'rate',
      'saleprice',
      'mrp',
      'saleamount',
      'ಬೆಲೆ',
      'मूल्य',
      'दर',
    ].includes(clean)
  ) {
    return 'unitPrice';
  }

  // Stock on Hand
  if (
    [
      'stockonhand',
      'stock',
      'stockquantity',
      'currentstock',
      'closingbalance',
      'closingstock',
      'qtyonhand',
      'onhand',
      'balance',
      'inventory',
      'ದಾಸ್ತಾನು',
      'स्टॉक',
      'बचास्टॉक',
    ].includes(clean)
  ) {
    return 'stockOnHand';
  }

  // Unit Cost
  if (
    [
      'unitcost',
      'cost',
      'costprice',
      'purchaseprice',
      'purchaserate',
      'costrate',
      'ಖರೀದಿಬೆಲೆ',
      'लागत',
      'खरीददर',
    ].includes(clean)
  ) {
    return 'unitCost';
  }

  // Supplier Lead Days
  if (
    [
      'supplierleaddays',
      'leaddays',
      'leadtime',
      'deliverydays',
      'supplierdays',
    ].includes(clean)
  ) {
    return 'supplierLeadDays';
  }

  // Reorder Level
  if (
    [
      'reorderlevel',
      'reorderpoint',
      'safetystock',
      'minstock',
      'minimumlevel',
    ].includes(clean)
  ) {
    return 'reorderLevel';
  }

  // Supplier Name
  if (
    [
      'suppliername',
      'supplier',
      'vendor',
      'distributor',
      'ಸರಬರಾಜುದಾರ',
      'सप्लायर',
    ].includes(clean)
  ) {
    return 'supplierName';
  }

  return clean;
}

/**
 * Process parsed raw rows into validated SalesRecord and InventoryItem arrays
 */
export function processRawRows(
  rows: Record<string, string | number | undefined>[],
  existingInventory: InventoryItem[] = []
): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!rows || rows.length === 0) {
    return {
      success: false,
      salesRecords: [],
      inventoryItems: [],
      hasInventoryData: false,
      totalRows: 0,
      validRows: 0,
      errors: ['The uploaded file has no data rows.'],
      warnings: [],
    };
  }

  // Inspect headers
  const firstRow = rows[0];
  const originalHeaders = Object.keys(firstRow);
  const mappedHeaders: Record<string, string> = {};
  for (const h of originalHeaders) {
    mappedHeaders[h] = normalizeColumnHeader(h);
  }

  const normalizedKeys = Object.values(mappedHeaders);

  // Check required keys: date, unitsSold, unitPrice
  const hasDate = normalizedKeys.includes('date');
  const hasUnitsSold = normalizedKeys.includes('unitsSold');
  const hasUnitPrice = normalizedKeys.includes('unitPrice');
  const hasProductId = normalizedKeys.includes('productId') || normalizedKeys.includes('productName');

  if (!hasDate || !hasUnitsSold || !hasUnitPrice || !hasProductId) {
    const missing: string[] = [];
    if (!hasDate) missing.push('Date (e.g. date, invoice_date)');
    if (!hasProductId) missing.push('Product ID or Name (e.g. item_name, sku)');
    if (!hasUnitsSold) missing.push('Units Sold (e.g. qty, units_sold)');
    if (!hasUnitPrice) missing.push('Unit Price (e.g. price, rate, mrp)');

    return {
      success: false,
      salesRecords: [],
      inventoryItems: [],
      hasInventoryData: false,
      totalRows: rows.length,
      validRows: 0,
      errors: [`Missing required columns: ${missing.join(', ')}`],
      warnings: [],
      mappedColumns: mappedHeaders,
    };
  }

  const hasInventoryFields =
    normalizedKeys.includes('stockOnHand') || normalizedKeys.includes('unitCost');

  if (!hasInventoryFields) {
    warnings.push(
      'File does not have stock_on_hand column. BizCopilot will calculate cover using existing shop stock levels.'
    );
  }

  const validSales: SalesRecord[] = [];
  const inventoryMap = new Map<string, InventoryItem>();

  for (const inv of existingInventory) {
    inventoryMap.set(inv.productId, { ...inv });
  }

  let rowIdx = 0;
  for (const rawRow of rows) {
    rowIdx++;
    // Translate row keys
    const row: Record<string, string | number | undefined> = {};
    for (const [origKey, val] of Object.entries(rawRow)) {
      const normKey = mappedHeaders[origKey] || origKey;
      row[normKey] = val;
    }

    // Date parsing
    let rawDate = String(row['date'] || '').trim();
    if (!rawDate) continue;

    // Support excel serial dates or YYYY-MM-DD or DD-MM-YYYY
    if (!isNaN(Number(rawDate)) && Number(rawDate) > 30000 && Number(rawDate) < 60000) {
      // Excel serial date to YYYY-MM-DD
      const dateObj = new Date((Number(rawDate) - (25567 + 2)) * 86400 * 1000);
      rawDate = dateObj.toISOString().slice(0, 10);
    } else if (rawDate.includes('/')) {
      const parts = rawDate.split('/');
      if (parts.length === 3) {
        if (parts[2].length === 4) {
          // DD/MM/YYYY
          rawDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
    }

    const date = rawDate.slice(0, 10);
    const productId = String(row['productId'] || row['productName'] || `SKU-${rowIdx}`).trim();
    const productName = String(row['productName'] || row['productId'] || 'General Item').trim();
    const category = String(row['category'] || 'General').trim();

    const unitsSold = Number(row['unitsSold']);
    if (isNaN(unitsSold) || unitsSold < 0) {
      errors.push(`Row ${rowIdx}: Invalid units sold value '${row['unitsSold']}'`);
      continue;
    }

    const unitPrice = Number(row['unitPrice']);
    if (isNaN(unitPrice) || unitPrice < 0) {
      errors.push(`Row ${rowIdx}: Invalid unit price value '${row['unitPrice']}'`);
      continue;
    }

    validSales.push({
      date,
      productId,
      productName,
      category,
      unitsSold,
      unitPrice,
    });

    // Populate inventory if present
    if (row['stockOnHand'] !== undefined && row['stockOnHand'] !== '') {
      const stockOnHand = Number(row['stockOnHand']);
      const reorderLevel = Number(row['reorderLevel'] || 15);
      const supplierLeadDays = Number(row['supplierLeadDays'] || 3);
      const unitCost = Number(row['unitCost'] || unitPrice * 0.7);

      if (!isNaN(stockOnHand) && stockOnHand >= 0) {
        inventoryMap.set(productId, {
          productId,
          productName,
          category,
          stockOnHand,
          reorderLevel: isNaN(reorderLevel) ? 15 : reorderLevel,
          supplierLeadDays: isNaN(supplierLeadDays) ? 3 : supplierLeadDays,
          unitCost: isNaN(unitCost) ? Math.round(unitPrice * 0.7) : unitCost,
          retailPrice: unitPrice,
        });
      }
    }
  }

  return {
    success: validSales.length > 0,
    salesRecords: validSales,
    inventoryItems: Array.from(inventoryMap.values()),
    hasInventoryData: hasInventoryFields,
    totalRows: rows.length,
    validRows: validSales.length,
    errors: errors.slice(0, 5),
    warnings,
    mappedColumns: mappedHeaders,
  };
}

/**
 * Parse an Excel (.xlsx, .xls) file buffer
 */
export function parseExcelBuffer(
  buffer: ArrayBuffer,
  existingInventory: InventoryItem[] = []
): ParseResult {
  try {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        success: false,
        salesRecords: [],
        inventoryItems: [],
        hasInventoryData: false,
        totalRows: 0,
        validRows: 0,
        errors: ['The Excel workbook contains no sheets.'],
        warnings: [],
      };
    }

    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet);
    return processRawRows(rawRows, existingInventory);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      salesRecords: [],
      inventoryItems: [],
      hasInventoryData: false,
      totalRows: 0,
      validRows: 0,
      errors: [`Excel parsing failed: ${msg}`],
      warnings: [],
    };
  }
}

/**
 * Parse a CSV string via PapaParse
 */
export function parseCSVString(
  content: string,
  existingInventory: InventoryItem[] = []
): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string | number | undefined>>(content, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(processRawRows(results.data, existingInventory));
      },
      error: (err: Error) => {
        resolve({
          success: false,
          salesRecords: [],
          inventoryItems: [],
          hasInventoryData: false,
          totalRows: 0,
          validRows: 0,
          errors: [`CSV error: ${err.message}`],
          warnings: [],
        });
      },
    });
  });
}
