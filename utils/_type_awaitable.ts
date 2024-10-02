// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license

/**
 * Type for a value that can be awaited.
 *
 * @template T - The type of the value.
 */
export type Awaitable<T> = T | Promise<T>;
