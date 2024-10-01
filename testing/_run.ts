// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license

import { TestContextImpl } from './_context.ts';

export interface RunTestOptions {
  /** The root directory to search for tests (Defaults to the current directory). */
  rootDir?: string;
  /** List of test files URls to run. */
  files: string[];
}

export async function runTests(options: RunTestOptions): Promise<void> {
  const { rootDir, files } = {
    ...options,
    rootDir: Deno.cwd(),
  };

  console.log('');
  console.log(`> Running tests`);
  console.log('');

  for await (const path of files) {
    console.log(`\u{276f} ${path}`);
    console.log('');
    await TestContextImpl.impl({ path, rootDir });
    console.log('');
  }

  TestContextImpl.logSummary();

  console.log('');
}
