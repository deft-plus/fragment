/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { setCurrentConsumer } from '@/signal/_graph.ts';

/** Reads the value of a signal without creating a dependency. */
export function untracked<T>(readFn: () => T): T {
  const previousConsumer = setCurrentConsumer(null);

  // We are not trying to catch any particular errors here, just making sure that the consumers
  // stack is restored in case of errors.
  try {
    return readFn();
  } finally {
    setCurrentConsumer(previousConsumer);
  }
}
