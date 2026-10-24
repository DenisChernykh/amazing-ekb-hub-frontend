import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('place detail header offset contract', () => {
  it('keeps sticky platform navigation below both site header states', () => {
    const navigation = readFileSync(
      resolve(process.cwd(), 'src/widgets/place-detail/ui/place-detail-platform-navigation.tsx'),
      'utf8',
    );
    const styles = readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8');

    expect(navigation).toContain(
      'place-detail-platform-navigation place-detail-viewport-height sticky',
    );
    expect(navigation).not.toContain('sticky top-0');
    expect(styles).toContain('.site-header-expanded ~ *');
    expect(styles).toContain('.site-header-compact ~ *');
    expect(styles).toContain(
      'top: var(--site-header-offset, var(--spacing-site-header-expanded));',
    );
    expect(styles).toContain('100dvh - var(--site-header-offset');
  });
});
