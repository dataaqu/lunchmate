export type Category = 'restaurant' | 'cafe' | 'fast_food';

export const CATEGORY_PLACE_TYPES: Record<Category, string[]> = {
  restaurant: ['restaurant'],
  cafe: ['cafe'],
  fast_food: ['fast_food_restaurant'],
};

export function isValidCategory(value: string): value is Category {
  return value in CATEGORY_PLACE_TYPES;
}
