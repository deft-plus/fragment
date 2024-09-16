// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license
// This module is browser compatible.

import { AssertionError, equal } from '@std/assert';

export function expect(actual: unknown): Expect {
  return new Expect(actual);
}

/** The Matchers class contains all the matchers that can be used with the expect function. */
export abstract class Matchers {
  protected abstract negated: boolean;
  protected abstract actual: unknown;

  public toBe(expected: unknown): void {
    this._throwError(this.actual === expected, {
      default: `Expected ${this.actual} to be ${expected}`,
      negated: `Expected ${this.actual} not to be ${expected}`,
    });
  }

  public toEqual(expected: unknown): void {
    this._throwError(equal(this.actual, expected), {
      default: `Expected ${this.actual} to equal ${expected}`,
      negated: `Expected ${this.actual} not to equal ${expected}`,
    });
  }

  public toStrictEqual(expected: unknown): void {
    this._throwError(equal(this.actual, expected), {
      default: `Expected ${this.actual} to strict equal ${expected}`,
      negated: `Expected ${this.actual} not to strict equal ${expected}`,
    });
  }

  public toThrow(errorMessage?: string): void {
    let thrown = false;
    let error: Error | undefined;

    if (typeof this.actual !== 'function') {
      throw new AssertionError('Expect.toThrow must be called with a function or a promise');
    }

    try {
      this.actual();
    } catch (e) {
      thrown = true;
      error = e;
    }

    this._throwError(thrown, {
      default: 'Expected function to throw',
      negated: 'Expected function not to throw',
    });

    if (errorMessage) {
      this._throwError(error?.message === errorMessage, {
        default: `Expected error message not to be ${errorMessage}`,
        negated: `Expected error message to be ${errorMessage}, but got ${error?.message}`,
      });
    }
  }

  public toBeUndefined(): void {
    this._throwError(this.actual === undefined, {
      default: `Expected ${this.actual} to be undefined`,
      negated: `Expected ${this.actual} not to be undefined`,
    });
  }

  public async toReject(errorMessage?: string): Promise<void> {
    let thrown = false;
    let error: Error | undefined;

    if (!(this.actual instanceof Promise) && typeof this.actual !== 'function') {
      throw new AssertionError('Expect.toReject must be called with a function or a promise');
    }

    try {
      const promise = typeof this.actual === 'function' ? this.actual() : this.actual;
      await promise;
    } catch (e) {
      thrown = true;
      error = e;
    }

    this._throwError(thrown, {
      default: 'Expected promise to reject',
      negated: 'Expected promise not to reject',
    });

    if (errorMessage) {
      this._throwError(error?.message === errorMessage, {
        default: `Expected error message not to be ${errorMessage}`,
        negated: `Expected error message to be ${errorMessage}, but got ${error?.message}`,
      });
    }
  }

  private _throwError(match: boolean, error: { default: string; negated: string }): void {
    if (this.negated && match) {
      throw new AssertionError(error.negated);
    } else if (!this.negated && !match) {
      throw new AssertionError(error.default);
    }
  }
}

/** The main class for the expect function. This class contains all the matchers */
export class Expect extends Matchers {
  protected negated = false;

  constructor(protected actual: unknown) {
    super();
  }

  get not(): NegatedExpect {
    return new NegatedExpect(this.actual);
  }
}

/** A negated version of the Expect class. */
export class NegatedExpect extends Matchers {
  protected negated = true;

  constructor(protected actual: unknown) {
    super();
  }
}
