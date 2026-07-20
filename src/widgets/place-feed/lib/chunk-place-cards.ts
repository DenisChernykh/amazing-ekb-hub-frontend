import type { PlaceCardModel } from '@/entities/place';

const PLACE_MODULE_SIZE = 5;

export function chunkPlaceCards(items: PlaceCardModel[]): PlaceCardModel[][] {
  const modules: PlaceCardModel[][] = [];

  for (let index = 0; index < items.length; index += PLACE_MODULE_SIZE) {
    modules.push(items.slice(index, index + PLACE_MODULE_SIZE));
  }

  return modules;
}
