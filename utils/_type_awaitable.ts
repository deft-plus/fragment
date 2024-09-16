/**
 * Type for a value that can be awaited.
 *
 * @template T - The type of the value.
 */
export type Awaitable<T> = T | Promise<T>;
