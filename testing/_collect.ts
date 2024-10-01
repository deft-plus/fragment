// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license

import { walkSync } from '@std/fs';

export interface CollectTestsOptions {
  /** The root directory to search for tests (Defaults to the current directory). */
  rootDir?: string;
  /** The pattern to match test files (Defaults to ending with _test.ts or _test.js). */
  testPattern?: string | RegExp;
}

/**
 * Collects all test files in the given directory and its subdirectories that match the given
 * pattern.
 *
 * @param options - The options to use when collecting tests.
 * @returns An array of test files.
 */
export function collectTests(options?: CollectTestsOptions): string[] {
  const testFiles: string[] = [];

  const { rootDir, testPattern } = {
    rootDir: Deno.cwd(),
    testPattern: /^(.*\/)?[^\/]+_test\.(ts|js)$/,
    ...options,
  };

  for (const entry of walkSync(rootDir)) {
    if (entry.isFile && entry.path.match(testPattern)) {
      testFiles.push(entry.path);
    }
  }

  return testFiles;
}
