import { getDefaultHomePlacesParams, listHomePlaces } from '@/app/di/place';
import type { ListPlacesParams, PlaceCategory } from '@/entities/place';
import { PlaceFeed } from '@/features/place-feed';
import { Card } from 'antd';
import type { CSSProperties } from 'react';

type SearchParamValue = string | string[] | undefined;

type HomePageSearchParams = {
  page?: SearchParamValue;
  search?: SearchParamValue;
  category?: SearchParamValue;
};

interface HomePageProps {
  searchParams?: Promise<HomePageSearchParams>;
}

const PLACE_CATEGORIES: readonly PlaceCategory[] = ['pools', 'spa', 'cafe', 'hotels', 'workshops'];

const pageStyle: CSSProperties = {
  padding: '40px 24px',
  display: 'grid',
  gap: '24px',
};

const introCardStyle: CSSProperties = {
  maxWidth: '960px',
  borderRadius: '24px',
};

const contentStyle: CSSProperties = {
  display: 'grid',
  gap: '16px',
};

const eyebrowStyle: CSSProperties = {
  margin: 0,
  color: 'rgba(0, 0, 0, 0.45)',
  fontSize: '14px',
  fontWeight: 600,
  letterSpacing: '0.08em',
  lineHeight: 1.4,
  textTransform: 'uppercase',
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
  lineHeight: 1.1,
};

const metaStyle: CSSProperties = {
  margin: 0,
  color: 'rgba(0, 0, 0, 0.65)',
  fontSize: '18px',
  lineHeight: 1.6,
};

function getSingleSearchParam(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    const firstValue = value[0]?.trim();

    return firstValue && firstValue.length > 0 ? firstValue : undefined;
  }

  const normalizedValue = value?.trim();

  return normalizedValue && normalizedValue.length > 0 ? normalizedValue : undefined;
}

function parsePositivePage(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return undefined;
  }

  return parsedValue;
}

function parsePlaceCategory(value: string | undefined): PlaceCategory | undefined {
  if (!value) {
    return undefined;
  }

  return PLACE_CATEGORIES.includes(value as PlaceCategory) ? (value as PlaceCategory) : undefined;
}

async function resolveHomePlacesParams(
  searchParamsPromise?: Promise<HomePageSearchParams>,
): Promise<ListPlacesParams> {
  const defaults = getDefaultHomePlacesParams();
  const searchParams = (await searchParamsPromise) ?? {};

  const page = parsePositivePage(getSingleSearchParam(searchParams.page));
  const search = getSingleSearchParam(searchParams.search);
  const category = parsePlaceCategory(getSingleSearchParam(searchParams.category));

  return {
    ...defaults,
    ...(page ? { page } : {}),
    ...(search ? { search } : {}),
    ...(category ? { category } : {}),
  };
}

export default async function HomePage({ searchParams }: Readonly<HomePageProps>) {
  const params = await resolveHomePlacesParams(searchParams);
  const result = await listHomePlaces(params);

  return (
    <main style={pageStyle}>
      <Card style={introCardStyle}>
        <section style={contentStyle}>
          <p style={eyebrowStyle}>Amazing EKB Hub</p>
          <h1 style={titleStyle}>Подборка мест в Екатеринбурге</h1>
          <p style={metaStyle}>
            Главная остается экраном выбора места: данные уже грузятся с backend, а карточный
            presentation вынесен в отдельный feature-слой.
          </p>
        </section>
      </Card>

      <PlaceFeed result={result} />
    </main>
  );
}
