# `@fragment/reactive`

This module provides the `signal` function for creating reactive values. Signals notify consumers when their value changes.

## Basics

A signal is a function (`() => T`) that returns its current value. It doesn't trigger side effects but may recompute values lazily.

**Reactive Contexts:** When a signal is accessed in a reactive context, it registers as a dependency. The context updates when any signal it depends on changes.

## Writable Signals

Use `signal()` to create a `WritableSignal`. It supports:

- `.set(value)`: Update the signal's value.
- `.update(func)`: Update using a function.
- `.mutate(func)`: Modify the current value directly.

Example:

```typescript
const counter = signal(0);

counter.set(2);
counter.update((count) => count + 1);
counter.mutate((list) => list.push({ title: 'New Task' }));
```

**Equality Comparator:** Optionally, provide a function to compare new and old values to prevent unnecessary updates.

## Read-Only Signals

Use `signal(value).readonly()` to create a read-only signal. It doesn't support updating the value.

Example:

```typescript
const counter = signal(0).readonly();
```

## Computed Values

We can create new expressions that depend on signals by wrapping a signal in a function (`() => signal`). When a signal changes, it updates the dependent function.

Example:

```typescript
const counter = signal(0);
const isEven = () => counter() % 2 === 0;
```

## Memoized Signals

Use `signal.memo()` for memoized signals that automatically update based on dependencies.

Example:

```typescript
const isEven = signal.memo(() => counter() % 2 === 0);
```

You can also configure the memoized signal with an equality comparator to prevent unnecessary updates. Or pass an onChange callback to run when the value changes.

```typescript
const isEven = signal.memo(
  () => counter() % 2 === 0,
  {
    equals: (prev, next) => prev === next,
    onChange: (value) => console.log('Changed:', value),
  },
);
```

## Promised Signals

The `signal.promise()` function creates a signal that resolves to a promise. It has a `status` property that indicates the promise state.

```typescript
const data = signal.promise(async () => {
  const response = await fetch('https://api.example.com/data');
  return response.json();
});

// Check every second for the data status
setInterval(() => {
  if (data().status === 'pending') {
    console.log('Loading...');
  }

  if (data().status === 'fulfilled') {
    console.log('Data:', data().value);
  }

  console.error('Error:', data().error);
}, 1000);
```

## Effects

`signal.effect()` schedules a function to run when signals it depends on change and returns a ref object. You can also provide a cleanup function to run before the effect is re-run.

Example:

```typescript
const counter = signal(0);
const effectRef = signal.effect(() => {
  console.log('Counter:', counter());
  return () => console.log('Cleanup');
});

counter.set(1);
effectRef.destroy();
```

## Untracked Values

Use `signal.untrack()` to create a signal that doesn't trigger reactivity when accessed in a reactive context.

Example:

```typescript
const counter = signal(0);
const untrackedValue = counter.untrack();

signal.effect(() => {
  console.log('Untracked:', counter.untrack());
});
```

# `@fragment/store`

The `@fragment/store` module provides a simple yet powerful way to manage global state in your application with minimal boilerplate. It leverages signals for reactive state management and ensures that your state is encapsulated, immutable, and easy to work with in a functional programming style.

## Why Use `store`?

- **Encapsulation**: Stores encapsulate state and logic, keeping your application organized and maintainable.
- **Atomic Updates**: Stores ensure that state updates are atomic, preventing unintended side effects.
- **Derived Values**: Easily compute values based on existing state without redundant calculations.
- **Immutability**: Stores enforce immutability, meaning state cannot be directly mutated, reducing bugs.

Use a store when you need to manage multiple related values, ensuring a single source of truth for your application's state.

## Getting Started

A store is an object containing values and actions. It uses signals internally to store and update values.

### Example

```typescript
type CounterStore = {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
};

const counterStore = store<CounterStore>(({ get }) => ({
  count: 0,
  increment: () => get().count.update((count) => count + 1),
  decrement: () => get().count.update((count) => count - 1),
  reset: () => get().count.set(0),
}));

console.log(counterStore.count()); // 0

counterStore.increment();
console.log(counterStore.count()); // 1

// Uncommenting the next line will result in an error because direct mutation is not allowed.
// counterStore.count.set(2); // Error: Property 'set' does not exist on type '() => number'.
```

## How `get` Works

The `get` function is your gateway to accessing store values and actions. It returns the current state of the store.

> **Note**: The `get` function returns a `WritableState<T>`, which is non-nullable. However, it's initially undefined when the store is created because the state isn't yet initialized. This ensures that the state is always accessible without needing constant null checks.

## Configure Signals

Instead of the default signal configuration, you can customize signals to suit your needs. This also allows you to create derived values that are automatically memoized.

### Example

```typescript
type CounterStore = {
  count: number;
  double: number;
  increment: () => void;
};

const counterStore = store<CounterStore>(({ get }) => ({
  count: 0,
  double: {
    value: () => get().count() * 2, // Automatically memoized if a function is used.
    // You can configure the signal here if needed.
  },
  increment: () => get().count.update((count) => count + 1),
}));

console.log(counterStore.double()); // 0
counterStore.increment();
console.log(counterStore.double()); // 2
```

With `@fragment/store`, you can build complex, reactive state management with ease while ensuring your application remains efficient and maintainable.
