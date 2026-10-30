import { InventoryItem, SalesRecord, CalculatedInventoryItem } from '@/lib/types';
import { SupportedLanguage } from '@/lib/i18n';

export type BusinessCategoryId =
  | 'kirana'
  | 'pharmacy'
  | 'apparel'
  | 'restaurant'
  | 'perishables'
  | 'hardware'
  | 'electronics'
  | 'distributor'
  | 'stationery'
  | 'salon'
  | 'manufacturer'
  | 'custom';

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'boolean';

export interface FieldDef {
  key: string;
  label: { en: string; kn: string; hi: string };
  type: FieldType;
  required?: boolean;
  options?: string[]; // For select types
  placeholder?: { en: string; kn: string; hi: string };
  isGridColumn?: boolean; // Show in the main inventory table
  format?: (val: unknown) => string;
}

export interface TermOverrides {
  stock: { en: string; kn: string; hi: string };
  supplier: { en: string; kn: string; hi: string };
  leadTime: { en: string; kn: string; hi: string };
  itemUnit: { en: string; kn: string; hi: string };
  reorderAction: { en: string; kn: string; hi: string };
}

export interface CategoryAlertRule {
  id: string;
  priority: 'critical' | 'warning' | 'info';
  evaluate: (facts: {
    inventory: CalculatedInventoryItem[];
    sales: SalesRecord[];
    periodDays: number;
    now?: Date;
  }) => {
    triggered: boolean;
    productId?: string;
    productName?: string;
    headline: { en: string; kn: string; hi: string };
    explanation: { en: string; kn: string; hi: string };
    supportingData: string;
    suggestedAction: { en: string; kn: string; hi: string };
    impactValue?: number;
    section: 'today' | 'week' | 'well';
  }[];
}

export interface KpiDef {
  id: string;
  label: { en: string; kn: string; hi: string };
  tooltip: { en: string; kn: string; hi: string };
  compute: (facts: {
    inventory: CalculatedInventoryItem[];
    sales: SalesRecord[];
    periodDays: number;
    now?: Date;
  }) => {
    value: string;
    numericValue?: number;
    sublabel?: string;
    status?: 'optimal' | 'warning' | 'critical';
  };
}

export interface FestivalSeasonality {
  id: string;
  name: { en: string; kn: string; hi: string };
  startMonth: number; // 1-12
  startDay: number;   // 1-31
  endMonth: number;   // 1-12
  endDay: number;     // 1-31
  multiplier: number; // e.g. 1.4 for +40% surge
  affectedCategories?: string[]; // SKU categories affected, or empty for all
  rationale: { en: string; kn: string; hi: string };
}

export interface CategoryConfig {
  id: BusinessCategoryId;
  icon: string; // Lucide icon identifier (e.g., 'Store', 'Pill', 'Shirt', 'Utensils', etc.)
  labels: { en: string; kn: string; hi: string };
  description: { en: string; kn: string; hi: string };
  productFields: FieldDef[];
  terms: TermOverrides;
  alertRules: CategoryAlertRule[];
  kpis: KpiDef[];
  defaultBufferDays: number;
  defaultLeadDays: number;
  seasonality: FestivalSeasonality[];
  whatsappTemplates: {
    order: (storeName: string, productName: string, qty: number, extra?: Record<string, unknown>, lang?: SupportedLanguage) => string;
    summary: (storeName: string, salesStr: string, riskCount: number, lang?: SupportedLanguage) => string;
  };
  demoDataset: () => {
    store: {
      name: string;
      type: string;
      location: string;
    };
    products: InventoryItem[];
    sales: SalesRecord[];
  };
}

export interface BusinessProfile {
  id?: number;
  categoryId: BusinessCategoryId;
  businessName: string;
  city: string;
  language: SupportedLanguage;
  createdAt: string;
}
