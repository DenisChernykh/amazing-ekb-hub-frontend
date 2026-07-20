import type { PlaceCategory } from '@/shared/api/generated/model/placeCategory';
import { listPlaceCategories } from '@/shared/api/generated/places/places';

export async function fetchPublicCategories(): Promise<PlaceCategory[]> {
  const response = await listPlaceCategories();
  return response.data.items;
}
