// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license

/**
 * This module contains the error parser for the testing runner. This is useful for parsing errors
 * and extracting useful information from them to display in the logs.
 *
 * @module
 */

/**
 * Parses an error from a log message and extracts useful information from it.
 *
 * @param error - The error to parse.
 * @param path - The path to the source file where the error occurred.
 * @returns The parsed error or null if the error could not be parsed.
 * @internal
 */
export function parseError(error: unknown, path: string): ParsedError | null {
  if (!(error instanceof Error)) {
    return null;
  }

  const stack = error.stack;
  if (!stack) {
    return null;
  }

  const lines = stack.split('\n');
  if (!(lines.length > 1)) {
    return null;
  }

  const line = lines.find((line) => line.includes(path)); // Get the exact line for the error.
  if (!line) {
    return null;
  }

  const match = line.match(/file:\/\/([^:]+):(\d+):(\d+)/);
  if (!match) {
    return null;
  }

  const [, filePath, lineStr, columnStr] = match;
  return {
    filePath,
    line: parseInt(lineStr, 10),
    column: parseInt(columnStr, 10),
  };
}

/**
 * Represents an error that has been parsed from a log message.
 * @internal
 */
export interface ParsedError {
  /** The path to the source file where the error occurred. */
  filePath: string;
  /** The line number where the error occurred. */
  line: number;
  /** The column number where the error occurred. */
  column: number;
}
