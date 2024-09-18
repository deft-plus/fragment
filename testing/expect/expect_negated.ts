// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license
// This module is browser compatible.

import { Matchers } from './matchers.ts';

/** A negated version of the Expect class. */
export class ExpectNegated extends Matchers {
  /** Whether the assertion is negated or not. */
  protected negated = true;

  /**
   * Creates a new ExpectNegated instance.
   *
   * @param actual - The actual value.
   */
  constructor(protected actual: unknown) {
    super();
  }
}
