# `@fragment/signal`

This module provides the `signal` function for creating reactive values. Signals notify consumers
when their value changes.

## Basics

A signal is a function (`() => T`) that returns its current value. It doesn't trigger side effects
but may recompute values lazily.

**Reactive Contexts:** When a signal is accessed in a reactive context, it registers as a
dependency. The context updates when any signal it depends on changes.

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

**Equality Comparator:** Optionally, provide a function to compare new and old values to prevent
unnecessary updates.

## Read-Only Signals

Use `signal(value).readonly()` to create a read-only signal. It doesn't support updating the value.

Example:

```typescript
const counter = signal(0).readonly();
```

## Computed Values

We can create new expressions that depend on signals by wrapping a signal in a function
(`() => signal`). When a signal changes, it updates the dependent function.

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

## Promised Signals

The `signal.promise()` function creates a signal that resolves to a promise. It has a `status`
property that indicates the promise state.

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

`signal.effect()` schedules a function to run when signals it depends on change and returns a
cleanup function. You can also provide a cleanup function to run before the effect is re-run.

Example:

```typescript
const counter = signal(0);
const cleanup = signal.effect(() => {
  console.log('Counter:', counter());
  return () => console.log('Cleanup');
});

counter.set(1);
cleanup();
```

## Batch Updates

Use `signal.batch()` to batch updates to signals. It prevents reactivity until the batch is
complete.

Example:

```typescript
signal.batch(() => {
  counter.set(1);
  counter.set(2);
});
```
