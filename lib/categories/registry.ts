import { CategoryConfig, BusinessCategoryId } from './types';
import { kiranaCategory } from './kirana';
import { pharmacyCategory } from './pharmacy';
import { apparelCategory } from './apparel';
import { restaurantCategory } from './restaurant';
import { perishablesCategory } from './perishables';
import { hardwareCategory } from './hardware';
import { electronicsCategory } from './electronics';
import { distributorCategory } from './distributor';
import { stationeryCategory } from './stationery';
import { salonCategory } from './salon';
import { manufacturerCategory } from './manufacturer';
import { customCategory } from './custom';

export const DEFAULT_CATEGORY_ID: BusinessCategoryId = 'kirana';

const CATEGORIES_MAP: Record<BusinessCategoryId, CategoryConfig> = {
  kirana: kiranaCategory,
  pharmacy: pharmacyCategory,
  apparel: apparelCategory,
  restaurant: restaurantCategory,
  perishables: perishablesCategory,
  hardware: hardwareCategory,
  electronics: electronicsCategory,
  distributor: distributorCategory,
  stationery: stationeryCategory,
  salon: salonCategory,
  manufacturer: manufacturerCategory,
  custom: customCategory,
};

export const ALL_CATEGORIES: CategoryConfig[] = [
  kiranaCategory,
  pharmacyCategory,
  apparelCategory,
  restaurantCategory,
  perishablesCategory,
  hardwareCategory,
  electronicsCategory,
  distributorCategory,
  stationeryCategory,
  salonCategory,
  manufacturerCategory,
  customCategory,
];

export function getCategory(id?: string): CategoryConfig {
  if (!id) return kiranaCategory;
  const key = id.toLowerCase().trim() as BusinessCategoryId;
  return CATEGORIES_MAP[key] || kiranaCategory;
}

export function listCategories(): CategoryConfig[] {
  return ALL_CATEGORIES;
}

export * from './types';
