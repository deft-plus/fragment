// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license

import { parseError } from './_error_parser.ts';
import { getSourceSnippet } from './_logger.ts';

// deno-lint-ignore-file no-console

export interface TestContextImplOptions {
  path: string;
  rootDir: string;
}

interface Definition extends Omit<Deno.TestStepDefinition, 'fn'> {
  name: string;
  fn: (t: Deno.TestContext) => Promise<void>;
}

type StepArgs =
  | [definition: Deno.TestStepDefinition]
  | [name: string, fn: (t: Deno.TestContext) => void | Promise<void>]
  | [fn: (t: Deno.TestContext) => void | Promise<void>];

export class TestContextImpl implements Deno.TestContext {
  /** The name of the test. */
  public name: string;
  /** The origin of the test (file path). */
  public origin: string;
  /** The parent test context. */
  public parent: TestContextImpl | undefined = undefined;

  private static failedTests: { name: string; error: Error; context: TestContextImpl }[] = [];

  private steps: Definition[] = [];
  private fn: (t: Deno.TestContext) => Promise<void>;
  private error: Error | null = null;
  private hasFailedStep: boolean = false;
  private indentationLevel: number;

  constructor(options: TestContextImplOptions & Definition & { indentationLevel?: number }) {
    this.origin = options.path;
    this.name = options.name;
    this.fn = async (t: Deno.TestContext) => {
      await options.fn(t);
    };
    this.indentationLevel = options.indentationLevel ?? 0;
  }

  public step(definition: Deno.TestStepDefinition): Promise<boolean>;
  public step(name: string, fn: (t: Deno.TestContext) => void | Promise<void>): Promise<boolean>;
  public step(fn: (t: Deno.TestContext) => void | Promise<void>): Promise<boolean>;
  public step(...args: StepArgs): Promise<boolean> {
    const options = TestContextImpl.definition(...args);
    this.steps.push(options);
    return Promise.resolve(true);
  }

  private static definition(...args: StepArgs): Definition {
    if (args.length === 1) {
      if (typeof args[0] === 'function') {
        return {
          name: 'unnamed test',
          fn: args[0] as Definition['fn'],
        };
      }

      return args[0] as Definition;
    }

    return {
      name: args[0] as string,
      fn: args[1] as Definition['fn'],
    };
  }

  public async run(): Promise<boolean> {
    try {
      await this.fn(this);

      if (this.steps.length > 0) {
        this.logGroupStart();
      }

      await this.executeSteps();

      if (this.hasFailedStep || this.error) {
        throw this.error ?? new Error('One or more steps failed');
      }

      this.logGroupEnd(true);
      return true;
    } catch (error) {
      this.error = error;
      if (error.message !== 'One or more steps failed') {
        TestContextImpl.failedTests.push({ name: this.name, error, context: this });
      }
      this.logGroupEnd(false);
      return false;
    }
  }

  private async executeSteps(): Promise<void> {
    for (const stepDef of this.steps) {
      const childContext = new TestContextImpl({
        path: this.origin,
        rootDir: '', // Not used
        name: stepDef.name,
        fn: stepDef.fn,
        indentationLevel: this.indentationLevel + 1,
      });
      childContext.parent = this;

      const result = await childContext.run();

      if (!result) {
        this.hasFailedStep = true;
      }
    }
  }

  private logGroupStart(): void {
    const indent = '  '.repeat(this.indentationLevel);
    console.log(`${indent}\u{276f} ${this.name} ...`);
  }

  private logGroupEnd(success: boolean): void {
    const indent = '  '.repeat(this.indentationLevel);
    if (success) {
      console.log(`${indent}\u{2713} ${this.name}`);
    } else {
      console.error(`${indent}\u{00d7} ${this.name}: ${this.error?.message}`);
    }
  }

  public static logSummary(): void {
    if (TestContextImpl.failedTests.length === 0) {
      console.log('All tests passed.');
      return;
    }

    console.error('The following tests failed:');
    console.error('');

    for (let i = 0; i < TestContextImpl.failedTests.length; i++) {
      const { name, error, context } = TestContextImpl.failedTests[i];

      const parsedError = parseError(error, context.origin);
      if (parsedError) {
        const code = getSourceSnippet(parsedError);
        // Log parent group
        console.error(`  \u{276f} ${context.parent?.name}`);
        console.error(
          `  \u{276f} ${name} \u{2014} ${parsedError.filePath}:${parsedError.line}:${parsedError.column}`,
        );
        console.error('');
        console.error(code);

        const isLast = i === TestContextImpl.failedTests.length - 1;
        if (!isLast) {
          console.error('');
          console.error('');
        }
      } else {
        console.error(`  ${name}`);
      }
    }
  }

  public static async impl(options: TestContextImplOptions): Promise<void> {
    const originalTest = Deno.test;

    const tests: TestContextImpl[] = [];

    Object.assign(Deno, {
      test: (...args: StepArgs) => {
        const testOptions = TestContextImpl.definition(...args);

        const testContext = new TestContextImpl({
          ...options,
          name: testOptions.name,
          fn: testOptions.fn,
        });

        tests.push(testContext);

        return Promise.resolve();
      },
    });

    await import(options.path);

    // Now run the tests in order
    for (const testContext of tests) {
      await testContext.run();
      console.log('');
    }

    Object.assign(Deno, { test: originalTest });
  }
}
