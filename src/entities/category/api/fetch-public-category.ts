import type { PlaceCategory } from '@/shared/api/generated/model/placeCategory';
import { getPlaceCategory } from '@/shared/api/generated/places/places';
import { isGeneratedApiError } from '@/shared/lib/api/is-generated-api-error';

export async function fetchPublicCategory(categorySlug: string): Promise<PlaceCategory | null> {
  try {
    const response = await getPlaceCategory({ categorySlug });
    return response.data;
  } catch (error) {
    if (isGeneratedApiError(error) && error.status === 404) return null;
    throw error;
  }
}
