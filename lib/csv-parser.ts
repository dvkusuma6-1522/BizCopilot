import Papa from 'papaparse';
import { InventoryItem, SalesRecord } from './types';

export interface ParseResult {
  success: boolean;
  salesRecords: SalesRecord[];
  inventoryItems: InventoryItem[];
  hasInventoryData: boolean;
  totalRows: number;
  validRows: number;
  errors: string[];
  warnings: string[];
}

// Normalize column names to canonical forms
function normalizeHeader(header: string): string {
  const clean = header.trim().toLowerCase().replace(/[\s\-_]+/g, '');
  if (['date', 'transactiondate', 'salesdate'].includes(clean)) return 'date';
  if (['productid', 'itemid', 'id', 'pid'].includes(clean)) return 'productId';
  if (['productname', 'itemname', 'name', 'product', 'title'].includes(clean)) return 'productName';
  if (['category', 'itemcategory', 'dept'].includes(clean)) return 'category';
  if (['unitssold', 'units', 'quantity', 'qty', 'sold'].includes(clean)) return 'unitsSold';
  if (['unitprice', 'price', 'sellingprice', 'mrp', 'rate'].includes(clean)) return 'unitPrice';
  if (['stockonhand', 'stock', 'currentstock', 'inventory', 'qtyonhand'].includes(clean))
    return 'stockOnHand';
  if (['reorderlevel', 'reorderpoint', 'minstock', 'safetystock'].includes(clean))
    return 'reorderLevel';
  if (['supplierleaddays', 'leaddays', 'leadtime', 'leadtimedays'].includes(clean))
    return 'supplierLeadDays';
  if (['unitcost', 'cost', 'costprice', 'purchaseprice'].includes(clean)) return 'unitCost';
  return clean;
}

export function parseCSVFile(
  fileContent: string,
  existingInventory: InventoryItem[]
): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string | number | undefined>>(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => normalizeHeader(header),
      complete: (results) => {
        const rows = results.data;
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!rows || rows.length === 0) {
          resolve({
            success: false,
            salesRecords: [],
            inventoryItems: [],
            hasInventoryData: false,
            totalRows: 0,
            validRows: 0,
            errors: ['The uploaded CSV file is empty.'],
            warnings: [],
          });
          return;
        }

        const firstRow = rows[0];
        const headers = Object.keys(firstRow);

        // Required headers for sales
        const requiredSalesHeaders = ['date', 'productId', 'unitsSold', 'unitPrice'];
        const missingHeaders = requiredSalesHeaders.filter((h) => !headers.includes(h));

        if (missingHeaders.length > 0) {
          resolve({
            success: false,
            salesRecords: [],
            inventoryItems: [],
            hasInventoryData: false,
            totalRows: rows.length,
            validRows: 0,
            errors: [
              `Missing required columns: ${missingHeaders.join(', ')}. Expected: date, product_id, units_sold, unit_price.`,
            ],
            warnings: [],
          });
          return;
        }

        const hasInventoryFields =
          headers.includes('stockOnHand') || headers.includes('reorderLevel');

        if (!hasInventoryFields) {
          warnings.push(
            'The CSV does not contain stock columns (stock_on_hand, reorder_level). Inventory analysis will use existing stock levels.'
          );
        }

        const validSales: SalesRecord[] = [];
        const latestInventoryMap = new Map<string, InventoryItem>();

        // Prepopulate existing inventory
        for (const inv of existingInventory) {
          latestInventoryMap.set(inv.productId, { ...inv });
        }

        let rowIndex = 0;
        for (const row of rows) {
          rowIndex++;

          // Date validation
          const rawDate = String(row['date'] || '').trim();
          if (!rawDate || !/^\d{4}-\d{2}-\d{2}/.test(rawDate)) {
            errors.push(`Row ${rowIndex}: Invalid date '${rawDate}'. Expected YYYY-MM-DD.`);
            continue;
          }
          const date = rawDate.slice(0, 10);

          const productId = String(row['productId'] || '').trim();
          if (!productId) {
            errors.push(`Row ${rowIndex}: Missing product_id.`);
            continue;
          }

          const productName = String(row['productName'] || productId).trim();
          const category = String(row['category'] || 'General').trim();

          const unitsSold = Number(row['unitsSold']);
          if (isNaN(unitsSold) || unitsSold < 0) {
            errors.push(`Row ${rowIndex}: Invalid units_sold '${row['unitsSold']}'.`);
            continue;
          }

          const unitPrice = Number(row['unitPrice']);
          if (isNaN(unitPrice) || unitPrice < 0) {
            errors.push(`Row ${rowIndex}: Invalid unit_price '${row['unitPrice']}'.`);
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

          // Check for inventory columns if provided
          if (row['stockOnHand'] !== undefined && row['stockOnHand'] !== '') {
            const stockOnHand = Number(row['stockOnHand']);
            const reorderLevel = Number(row['reorderLevel'] || 20);
            const supplierLeadDays = Number(row['supplierLeadDays'] || 3);
            const unitCost = Number(row['unitCost'] || unitPrice * 0.75);

            if (!isNaN(stockOnHand) && stockOnHand >= 0) {
              latestInventoryMap.set(productId, {
                productId,
                productName,
                category,
                stockOnHand,
                reorderLevel: isNaN(reorderLevel) ? 20 : reorderLevel,
                supplierLeadDays: isNaN(supplierLeadDays) ? 3 : supplierLeadDays,
                unitCost: isNaN(unitCost) ? unitPrice * 0.75 : unitCost,
                retailPrice: unitPrice,
              });
            }
          }
        }

        if (validSales.length === 0) {
          resolve({
            success: false,
            salesRecords: [],
            inventoryItems: [],
            hasInventoryData: false,
            totalRows: rows.length,
            validRows: 0,
            errors: errors.slice(0, 10),
            warnings,
          });
          return;
        }

        resolve({
          success: true,
          salesRecords: validSales,
          inventoryItems: Array.from(latestInventoryMap.values()),
          hasInventoryData: hasInventoryFields,
          totalRows: rows.length,
          validRows: validSales.length,
          errors: errors.slice(0, 10), // Limit error count for clean UI
          warnings,
        });
      },
      error: (err: Error) => {
        resolve({
          success: false,
          salesRecords: [],
          inventoryItems: [],
          hasInventoryData: false,
          totalRows: 0,
          validRows: 0,
          errors: [`Failed to parse CSV file: ${err.message}`],
          warnings: [],
        });
      },
    });
  });
}

// Generate downloadable sample CSV matching BizCopilot format
export function generateSampleCSVString(): string {
  const headers = [
    'date',
    'product_id',
    'product_name',
    'category',
    'units_sold',
    'unit_price',
    'stock_on_hand',
    'reorder_level',
    'supplier_lead_days',
    'unit_cost',
  ];

  const sampleRows = [
    ['2026-10-25', 'P001', 'Parle-G Biscuits 250g', 'Snacks', '18', '10', '120', '50', '2', '7.5'],
    ['2026-10-25', 'P002', 'Sunflower Cooking Oil 1L', 'Pantry', '4', '165', '10', '25', '5', '135'],
    ['2026-10-25', 'P003', 'Basmati Rice 5kg', 'Staples', '5', '450', '45', '20', '3', '360'],
    ['2026-10-25', 'P004', 'Chakki Wheat Flour 10kg', 'Staples', '6', '420', '35', '30', '3', '340'],
    ['2026-10-25', 'P005', 'Fresh Toned Milk 500ml', 'Dairy', '48', '32', '60', '40', '1', '26'],
    ['2026-10-25', 'P007', 'Spiced Potato Chips 100g', 'Snacks', '0', '35', '180', '30', '4', '25'],
    ['2026-10-26', 'P001', 'Parle-G Biscuits 250g', 'Snacks', '19', '10', '118', '50', '2', '7.5'],
    ['2026-10-26', 'P002', 'Sunflower Cooking Oil 1L', 'Pantry', '3', '165', '7', '25', '5', '135'],
    ['2026-10-26', 'P003', 'Basmati Rice 5kg', 'Staples', '4', '450', '41', '20', '3', '360'],
    ['2026-10-26', 'P007', 'Spiced Potato Chips 100g', 'Snacks', '0', '35', '180', '30', '4', '25'],
  ];

  return [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');
}
