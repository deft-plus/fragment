// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license
// This module is browser compatible.

import { AssertionError, equal } from '@std/assert';

export function expect(actual: unknown): Expect {
  return new Expect(actual);
}

export abstract class CommonMatcher {
  protected abstract negated: boolean;
  protected abstract actual: unknown;

  public toBe(expected: unknown): void {
    this.throwError(this.actual === expected, {
      negated: `Expected ${this.actual} not to be ${expected}`,
      positive: `Expected ${this.actual} to be ${expected}`,
    });
  }

  public toEqual(expected: unknown): void {
    this.throwError(equal(this.actual, expected), {
      negated: `Expected ${this.actual} not to equal ${expected}`,
      positive: `Expected ${this.actual} to equal ${expected}`,
    });
  }

  public toStrictEqual(expected: unknown): void {
    this.throwError(equal(this.actual, expected), {
      negated: `Expected ${this.actual} not to strict equal ${expected}`,
      positive: `Expected ${this.actual} to strict equal ${expected}`,
    });
  }

  public toThrow(errorMessage?: string): void {
    let thrown = false;
    let error: Error | undefined;

    try {
      (this.actual as () => void)();
    } catch (e) {
      thrown = true;
      error = e;
    }

    this.throwError(thrown, {
      negated: 'Expected function not to throw',
      positive: 'Expected function to throw',
    });

    if (errorMessage) {
      this.throwError(error?.message === errorMessage, {
        negated: `Expected error message to be ${errorMessage}, but got ${error?.message}`,
        positive: `Expected error message not to be ${errorMessage}`,
      });
    }
  }

  toBeUndefined(): void {
    this.throwError(this.actual === undefined, {
      negated: `Expected ${this.actual} not to be undefined`,
      positive: `Expected ${this.actual} to be undefined`,
    });
  }

  private throwError(match: boolean, error: { negated: string; positive: string }): void {
    if (this.negated && match) {
      throw new AssertionError(error.negated);
    } else if (!this.negated && !match) {
      throw new AssertionError(error.positive);
    }
  }
}

export class Expect extends CommonMatcher {
  protected negated = false;

  constructor(protected actual: unknown) {
    super();
  }

  get not(): NegatedExpect {
    return new NegatedExpect(this.actual);
  }
}

export class NegatedExpect extends CommonMatcher {
  protected negated = true;

  constructor(protected actual: unknown) {
    super();
  }
}
