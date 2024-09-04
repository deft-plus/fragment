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
