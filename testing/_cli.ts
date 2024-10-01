// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license

import { collectTests } from './_collect.ts';
import { TestContextImpl } from './_context.ts';

const testFiles = collectTests({
  testPattern: /(mod|mod_2)_test\.(ts|js)$/,
});

if (!testFiles.length) {
  console.log('No test files found.');
  Deno.exit(0); // Exit with success code.
}

await TestContextImpl.runner({
  files: testFiles,
});
