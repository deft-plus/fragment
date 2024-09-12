import type { Data, Page } from 'lume/core/file.ts';

import { walkSync } from '@std/fs';

/**
 * Resolves the stylesheet path based on the given page data.
 *
 * @param page - The page to resolve the stylesheet path for.
 * @returns The resolved stylesheet path.
 */
export function resolveStylesheetPath(page: Page<Data>): string {
  const pathIterator = walkSync(new URL('../../styles', import.meta.url).pathname, {
    exts: ['.scss'],
  });

  const ignoredPaths = [
    '_',
    '/components',
    '/layouts',
    '/lib',
  ];

  const paths = Array.from(pathIterator)
    .map((file) => file.path.replace(/.*\/styles/, '').replace(/\.scss$/, '')) // Strip path and extension
    .filter((file) => ignoredPaths.every((path) => !file.includes(path))); // Ignore ignored paths

  const pathFound = paths.find((file) => file === page.src.path);

  return pathFound ?? '/default';
}
