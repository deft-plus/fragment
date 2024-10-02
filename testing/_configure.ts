// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license

/**
 * This module configures the test runner and runs the tests.
 *
 * @example Usage
 *
 * Configure the test runner in a script.
 * ```ts
 * // scripts/test.ts
 * import { configure } from '@fragment/testing';
 *
 * await configure({
 *   rootDir: Deno.cwd(),
 *   testPattern: /mod_test\.(ts|js)$/, // Only run tests mod_test.ts and mod_test.js.
 * });
 * ```
 *
 * Optionally, you can create a task in the `deno.json` file to run the tests.
 * ```json
 * // deno.json
 * {
 *   "tasks": {
 *     "test": "deno run -A scripts/test.ts",
 *     "test:update": "deno run -A scripts/test.ts -- --update"
 *   }
 * }
 * ```
 *
 * Run the tests using the task.
 * ```sh
 * deno task test
 * ```
 *
 * ```sh
 * deno task test:update
 * ```
 *
 * @module
 */

import { walk } from '@std/fs';
import { TestContextImpl } from './_context.ts';

/** The options to configure the test runner. */
export interface ConfigureOptions {
  /** The root directory to search for test files. */
  rootDir?: string;
  /** The pattern to match test files. */
  testPattern?: RegExp;
}

/**
 * Configures the test runner with the given options and runs the tests.
 *
 * @param options The options to configure the test runner.
 * @returns A promise that resolves when the tests have finished running.
 */
export async function configure(options: ConfigureOptions): Promise<void> {
  const { rootDir, testPattern } = {
    rootDir: Deno.cwd(),
    testPattern: /^(.*\/)?[^\/]+_test\.(ts|js)$/,
    ...options,
  };

  const files: string[] = [];

  for await (const entry of walk(rootDir)) {
    if (entry.isFile && entry.path.match(testPattern)) {
      files.push(entry.path);
    }
  }

  if (!files.length) {
    console.log('No test files found.');
    Deno.exit(0); // Exit with success code.
  }

  await TestContextImpl.runner({
    files,
    rootDir,
  });
}
