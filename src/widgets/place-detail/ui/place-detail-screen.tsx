import type { PlaceDetailPageData } from '@/app/di/place-detail';
import { buildPlaceDetailScreenViewModel } from '@/widgets/place-detail/model/place-detail-screen.view-model';
import { PlaceDetailScreenContent } from './place-detail-screen-content';

/**
 * Параметры screen-level widget для detail-экрана места.
 */
export interface PlaceDetailScreenProps {
  data: PlaceDetailPageData;
}

/**
 * Рендерит весь detail-экран места как widget-level композицию.
 *
 * @param data - Полный server-side payload detail-страницы.
 * @returns Detail screen места.
 */
export function PlaceDetailScreen({ data }: Readonly<PlaceDetailScreenProps>) {
  const viewModel = buildPlaceDetailScreenViewModel(data);

  return <PlaceDetailScreenContent viewModel={viewModel} />;
}
