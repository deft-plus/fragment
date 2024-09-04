# `@fragment/store`

This module provides the `store` function, which creates an atomic and encapsulated store to manage state in a functional way with minimal boilerplate.

Stores are a way to manage global state in your application. They use signals internally to store values and update them. You can also derive values from other values.

The reason why stores are immutable is because they are not meant to be changed directly, but rather through the actions that are defined in the store.

You would want to use a store over a signal when you need to store multiple values that are related to each other. This makes it easier to manage the state of your application with a single source of truth.

## Basics

A store is an object with values and actions. It encapsulates state and provides a way to update it atomically. Stores are based off signals and use them for values and updates internally.

Example:

```typescript
// Values are considered signals and functions are considered actions.
type CounterStore = {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
};

// Store creation.
const counterStore = store<CounterStore>(({ get }) => ({
  count: 0,
  increment: () => get().count.update((count) => count + 1),
  decrement: () => get().count.update((count) => count - 1),
  reset: () => get().count.set(0),
}));

// Accessing store values.
console.log(counterStore.count()); // 0

// Accessing store actions.
counterStore.increment();
console.log(counterStore.count()); // 1

// Values are readonly signals to keep the store atomic.
counterStore.count.set(2); // Error: Property 'set' does not exist on type '() => number'.
```

## `get` Function

The `get` function is used to access store values and actions. It returns a proxy object that automatically wraps values in signals and actions in functions.

> **Note:**
>
> The `get` function returns a `WritableState<T>` and this cannot be nullable, but it is initially undefined when the store is created.
>
> This is because the state has not been created yet. Even if it could be undefined, it would be inconvenient to use because you would constantly need to check whether the state has been created or not. Therefore, the typings enforce that the state must be non-nullable.

## Derrived Values

You can derive values from other values in the store. This is useful when you need to compute a value based on other values in the store.

Example:

```typescript
type CounterStore = {
  count: number;
  double: number;
  increment: () => void;
};

const counterStore = store<CounterStore>(({ get }) => ({
  count: 0,
  double: {
    value: () => get().count() * 2, // If function is used, it will be memoized or if a value is used, it will be a signal.
    // You can configure the signal here...
  }
  increment: () => get().count.update((count) => count + 1),
}));

console.log(counterStore.double()); // 0
counterStore.increment();
console.log(counterStore.double()); // 2
```
