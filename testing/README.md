# 🧪 Testing

[![JSR](https://jsr.io/badges/@fragment/testing)](https://jsr.io/@fragment/testing) [![JSR Score](https://jsr.io/badges/@fragment/testing/score)](https://jsr.io/@fragment/testing)

The `@fragment/testing` module provides a powerful and flexible testing framework built for TypeScript and Deno. With an API similar to Vitest and Jest, it enables you to write unit tests, mocks, and assertions in a highly efficient and scalable way. This testing framework is fully integrated into the Fragment ecosystem, ensuring fine-grained control over tests, stubs, and spies while maintaining excellent performance.

## Installation

Install the `@fragment/testing` package using Deno:

```bash
deno add @fragment/testing
```

Or using npm:

```bash
npx jsr add @fragment/testing
```

## Writing Tests

The core of the `@fragment/testing` module revolves around test functions (`test()`). You can create individual test cases with the `test` method, and group related tests with the `group` block.

### Basic Test

Here's a basic example of how to write a test:

```typescript
import { expect, test } from '@fragment/testing';

test('should add numbers correctly', () => {
  expect(1 + 2).toBe(3);
});

test('should subtract numbers correctly', () => {
  expect(5 - 2).toBe(3);
});
```

### Grouping Tests

You can use `group` to group related tests together. This helps in organizing your tests and running them in a structured manner. This also help to keep the logs clean and easy to read.

```typescript
import { expect, group, test } from '@fragment/testing';

group('Math functions', () => {
  test('should add numbers correctly', () => {
    expect(1 + 2).toBe(3);
  });

  test('should subtract numbers correctly', () => {
    expect(5 - 2).toBe(3);
  });
});
```

### Skipping Tests

You can skip a test by using the `ignore` method:

```typescript
import { expect, group, test } from '@fragment/testing';

group.ignore('ignored group', () => {
  test.ignore('ignored test', () => {
    expect.toPass();
  });
});
```

### Focusing Tests

You can focus on a specific test by using the `only` method:

```typescript
import { expect, group, test } from '@fragment/testing';

group.only('focused group', () => {
  test.only('focused test', () => {
    expect.toPass();
  });
});
```

### Async Tests/Done Callback

Handle asynchronous operations with `async` and `await`:

```typescript
import { expect, group, test } from '@fragment/testing';

group('async tests', () => {
  test('fetches data from an API', async () => {
    const data = await fetchDataFromAPI();
    expect(data).toHaveProperty('name', 'John Doe');
  });

  test(
    'fetches data from an API with done callback',
    new Promise((done) => {
      fetchDataFromAPI().then((data) => {
        expect(data).toHaveProperty('name', 'John Doe');
        done();
      });
    }),
  );
});
```

## Mocking Functions

Mocking functions is easy with the `fn` feature. You can replace real functions with mock implementations, and make assertions based on how they are called.

### Creating a Mock

```typescript
import { fn } from '@fragment/testing';

const myMock = fn(() => 'Hello');

expect(myMock()).toReturn('Hello');
expect(myMock).toHaveBeenCalled();
```

### Spy on Real Functions

Use `spy` to observe calls to real functions without replacing their implementations.

```typescript
import { spy } from '@fragment/testing';

const obj = {
  greet: () => 'Hello',
};

const spy = spy(obj, 'greet');
obj.greet();

expect(spy).toHaveBeenCalled();
expect(spy).toReturn('Hello');
```

Using `spy` on standalone functions:

```typescript
function greet() {
  return 'Hello';
}

const spy = spy(greet);
greet();

expect(spy).toHaveBeenCalled();
expect(spy).toReturn('Hello');
```

Or in arrow functions:

```typescript
const greet = () => 'Hello';

const spy = spy(greet);
greet();

expect(spy).toHaveBeenCalled();
expect(spy).toReturn('Hello');
```

### Mocking Modules

You can also mock modules using the `mock` function:

```typescript
import { mock } from '@fragment/testing';

const fs = mock('fs', {
  // this will only affect "readFileSync" outside of the original module
  readFileSync: () => 'Hello',
});

expect(fs.readFileSync()).toBe('Hello');
```

Keep in mind that the `mock` function only affects the module in which it is called. It does not affect the original module. This means that the original module will still have its original implementation.

## Assertions

`@fragment/testing` comes with a rich set of built-in matchers, similar to Vitest/Jest, for writing flexible assertions.

### Common Matchers

- `.toBe(value)`: Checks if two values are identical.
- `.toEqual(value)`: Deep equality check.
- `.toStrictEqual(value)`: Deep equality check with strict equality.
- `.toMatch(pattern)`: Checks if a string matches a regular expression.
- `.toMatchSnapshot()`: Compares the current output to a stored snapshot.
- `.toThrow()`: Verifies that a function throws an error.
- `.toThrow(error)`: Verifies that a function throws the given error.
- `.toContain(item)`: Checks if an array or string contains an item.

Example:

```typescript
import { expect, test } from '@fragment/testing';

test('object assignment', () => {
  const obj = { a: 1 };
  obj.b = 2;
  expect(obj).toEqual({ a: 1, b: 2 });
});
```

## Snapshot Testing

You can also perform snapshot testing, which compares the current output of your tests to a stored snapshot.

### Basic Snapshot Test

```typescript
import { expect, test } from '@fragment/testing';

test('snapshot of a rendered component', async () => {
  const component = renderComponent();
  await expect(component).toMatchSnapshot();
});
```

### Error Snapshot Test

```typescript
import { expect, test } from '@fragment/testing';

test('snapshot of an error', async () => {
  const error = new Error('Something went wrong');
  await expect(error).toThrowMatchingSnapshot();
});
```

## Setup and Teardown

Use `beforeEach` and `afterEach` hooks to manage setup and cleanup code around test cases.

```typescript
import { afterEach, beforeEach, test } from '@fragment/testing';

beforeEach(() => {
  // Run before each test
});

afterEach(() => {
  // Cleanup after each test
});

test('test case with setup and teardown', () => {
  expect(true).toBe(true);
});
```

### Setup and Teardown for Groups

You can also use `beforeEachGroup` and `afterEachGroup` hooks to run setup and cleanup code around groups of tests.

```typescript
import { afterEachGroup, beforeEachGroup, group, test } from '@fragment/testing';

beforeEachGroup(() => {
  // Run before all tests in the group
});

afterEachGroup(() => {
  // Cleanup after all tests in the group
});

group('group with setup and teardown', () => {
  test('test case 1', () => {
    expect(true).toBe(true);
  });

  test('test case 2', () => {
    expect(true).toBe(true);
  });
});
```

### Global Setup and Teardown

You can also use `beforeAll` and `afterAll` hooks at the global level to run setup and cleanup code around all tests.

```typescript
import { afterAll, beforeAll, test } from '@fragment/testing';

beforeAll(() => {
  // Run before all tests
});

afterAll(() => {
  // Cleanup after all tests
});

test('test case with global setup and teardown', () => {
  expect(true).toBe(true);
});
```

## CLI Integration

`@fragment/testing` comes with a CLI to run tests in your project. You can run tests in parallel, get detailed test results, and even use the `watch` mode for continuous testing.

```bash
deno run -A jsr://@fragment/testing/cli.ts
```

For specific files:

```bash
deno run -A jsr://@fragment/testing/cli.ts test.ts test2.ts
```

Enable `watch` mode:

```bash
deno run -A jsr://@fragment/testing/cli.ts --watch
deno run -A jsr://@fragment/testing/cli.ts -w
```

### Configuration

You can also configure the test runner using a `configure` function:

```typescript
// file: scripts/test.ts
import { configure } from '@fragment/testing';

configure({
  files: '**/*_test.ts',
  watch: true,
});
```

Then run the script:

```bash
deno run -A scripts/test.ts
```

Behind the scenes, the `configure` function sets up the test runner with the specified configuration options.

## Summary

The `@fragment/testing` module delivers a complete testing solution for your Deno and TypeScript projects. With a syntax and feature set familiar to Vitest and Jest users, it integrates seamlessly into the Fragment framework, providing a unified experience for testing components, APIs, and application logic.
