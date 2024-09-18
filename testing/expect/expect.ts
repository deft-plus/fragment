// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license
// This module is browser compatible.

import { ExpectNegated } from './expect_negated.ts';
import { Matchers } from './matchers.ts';

/** The main class for the expect function. This class contains all the matchers */
export class Expect extends Matchers {
  /** Whether the assertion is negated or not. */
  protected negated = false;

  /**
   * Creates a new ExpectNegated instance.
   *
   * @param actual - The actual value.
   */
  constructor(protected actual: unknown) {
    super();
  }

  /** This is used to negate the next assertion. */
  get not(): ExpectNegated {
    return new ExpectNegated(this.actual);
  }
}
