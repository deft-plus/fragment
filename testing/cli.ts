// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license

/**
 * This module runs the tests.
 *
 * @example Usage
 * ```sh
 * deno run -A @fragment/testing/cli
 * ```
 *
 * ```sh
 * deno run -A @fragment/testing/cli -- --update
 * ```
 *
 * @module
 */

import { configure } from './_configure.ts';

await configure({
  // TODO(@miguelbogota): Change the variables for Deno.args.
  rootDir: Deno.cwd(),
  testPattern: /^(.*\/)?[^\/]+_test\.(ts|js)$/,
  // testPattern: /(mod|mod_2)_test\.(ts|js)$/,
});
