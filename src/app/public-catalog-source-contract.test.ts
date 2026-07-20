import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const CATALOG_SOURCE_ROOTS = [
  'src/app/layout.tsx',
  'src/app/(home)',
  'src/app/categories',
  'src/entities/category/ui',
  'src/entities/place/ui',
  'src/features/infinite-places',
  'src/widgets/category-grid',
  'src/widgets/place-feed',
  'src/widgets/site-header',
] as const;

const EXPECTED_CATALOG_SOURCE_FILES = [
  'src/app/layout.tsx',
  'src/app/(home)/page.tsx',
  'src/app/(home)/_components/home-category-section.tsx',
  'src/app/(home)/_components/show-all-categories-link.tsx',
  'src/app/categories/page.tsx',
  'src/app/categories/[categorySlug]/page.tsx',
  'src/app/categories/[categorySlug]/loading.tsx',
  'src/app/categories/[categorySlug]/error.tsx',
  'src/app/categories/[categorySlug]/_components/category-page-content.tsx',
  'src/entities/category/ui/category-card.tsx',
  'src/entities/category/ui/category-card-image.tsx',
  'src/entities/place/ui/place-card.tsx',
  'src/entities/place/ui/place-card-image.tsx',
  'src/features/infinite-places/model/use-infinite-places.ts',
  'src/features/infinite-places/ui/places-append-control.tsx',
  'src/widgets/category-grid/ui/category-grid.tsx',
  'src/widgets/place-feed/ui/infinite-place-feed.tsx',
  'src/widgets/place-feed/ui/place-feed.tsx',
  'src/widgets/site-header/ui/site-header.tsx',
] as const;

const CLASS_HELPER_NAMES = new Set(['cn', 'clsx', 'cva']);
const PRODUCTION_SOURCE_PATTERN = /\.tsx?$/;
const EXCLUDED_SOURCE_PATTERN = /\.(?:test|spec|generated)\.tsx?$/;

function collectProductionSourceFiles(path: string): string[] {
  const absolutePath = resolve(process.cwd(), path);
  const stats = statSync(absolutePath);

  if (stats.isFile()) {
    return PRODUCTION_SOURCE_PATTERN.test(path) && !EXCLUDED_SOURCE_PATTERN.test(path)
      ? [relative(process.cwd(), absolutePath)]
      : [];
  }

  return readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) =>
    collectProductionSourceFiles(resolve(path, entry.name)),
  );
}

function collectCatalogSourceFiles(): string[] {
  return [...new Set(CATALOG_SOURCE_ROOTS.flatMap(collectProductionSourceFiles))].sort();
}

function getTemplateText(node: ts.TemplateExpression): string {
  return (
    node.head.text + node.templateSpans.map(({ literal }) => `expression${literal.text}`).join('')
  );
}

function collectClassSourceText(node: ts.Node, values: Set<string>): void {
  if (ts.isStringLiteralLike(node)) {
    values.add(node.text);
    return;
  }

  if (ts.isTemplateExpression(node)) {
    values.add(getTemplateText(node));
    for (const { expression } of node.templateSpans) {
      collectClassSourceText(expression, values);
    }
    return;
  }

  ts.forEachChild(node, (child) => collectClassSourceText(child, values));
}

function findArbitraryTailwindUtilities(source: string): string[] {
  const sourceFile = ts.createSourceFile(
    'catalog-source.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const classSourceValues = new Set<string>();

  function visit(node: ts.Node): void {
    if (
      ts.isJsxAttribute(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'className' &&
      node.initializer
    ) {
      collectClassSourceText(node.initializer, classSourceValues);
    }

    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      CLASS_HELPER_NAMES.has(node.expression.text)
    ) {
      for (const argument of node.arguments) {
        collectClassSourceText(argument, classSourceValues);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return [
    ...new Set(
      [...classSourceValues]
        .flatMap((value) => value.split(/\s+/))
        .filter((token) => token.includes('[') && token.includes(']')),
    ),
  ];
}

describe('public catalog source contract', () => {
  it('contains no legacy query catalog slices', () => {
    expect(existsSync(resolve(process.cwd(), 'src/features/catalog-controls'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'src/features/places-pagination'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'src/widgets/places-catalog'))).toBe(false);
  });

  it('collects every controlled production root and the expected baseline files', () => {
    for (const root of CATALOG_SOURCE_ROOTS) {
      expect(existsSync(resolve(process.cwd(), root)), root).toBe(true);
    }

    const files = collectCatalogSourceFiles();
    expect(files).toEqual(expect.arrayContaining([...EXPECTED_CATALOG_SOURCE_FILES]));
    expect(files.length).toBeGreaterThanOrEqual(EXPECTED_CATALOG_SOURCE_FILES.length);
  });

  it.each([
    ['first class token', '<div className="w-[37px]" />', 'w-[37px]'],
    ['variant value', '<div className="hover:w-[37px]" />', 'hover:w-[37px]'],
    ['arbitrary property', '<div className="[font-family:Inter]" />', '[font-family:Inter]'],
    [
      'variant arbitrary property',
      '<div className={cn("lg:[writing-mode:vertical-rl]")} />',
      'lg:[writing-mode:vertical-rl]',
    ],
    ['negative arbitrary value', 'const styles = cva("-mt-[2px]");', '-mt-[2px]'],
    [
      'negative value inside brackets',
      '<div className={clsx("translate-x-[-50%]")} />',
      'translate-x-[-50%]',
    ],
  ])('detects %s in class sources', (_name, source, expected) => {
    expect(findArbitraryTailwindUtilities(source)).toContain(expected);
  });

  it('ignores brackets and arbitrary-looking text outside class sources', () => {
    const source = `
      // Example only: w-[37px]
      const route = '/categories/[categorySlug]';
      const arbitraryLookingText = 'w-[37px]';
      const first = items[0];
      const tuple: [string, number] = ['value', 1];
      const element = <div data-route="[categorySlug]" className="grid grid-cols-2" />;
    `;

    expect(findArbitraryTailwindUtilities(source)).toEqual([]);
  });

  it('adds no arbitrary Tailwind bracket utilities to the catalog source', () => {
    for (const path of collectCatalogSourceFiles()) {
      const source = readFileSync(resolve(process.cwd(), path), 'utf8');
      expect(findArbitraryTailwindUtilities(source), path).toEqual([]);
    }
  });
});
