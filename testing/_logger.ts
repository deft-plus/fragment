// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license
// TODO(@miguelbogota): Fix the colorizeCode function since it is not working as expected.

/**
 * Implements the logger for the testing runner.
 *
 * @module
 */

import type { ParsedError } from './_error_parser.ts';

// ANSI color codes for syntax highlighting.
const ANSI_COLORS = {
  RESET: '\x1b[0m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[38;5;75m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m',
  GRAY: '\x1b[90m',
};

// Regular expressions for syntax highlighting patterns.
const SYNTAX_PATTERNS = [
  // Keywords (e.g., const, let, if).
  { regex: /\b(const|let|var|if|else|function|class|constructor)\b/g, color: ANSI_COLORS.CYAN },

  // JavaScript reserved words (e.g., return, new, async).
  {
    regex:
      /\b(return|of|new|this|extends|implements|interface|abstract|static|public|private|protected|typeof|instanceof|switch|case|break|default|continue|try|catch|finally|throw|import|export|from|as|await|async|yield|void)\b/g,
    color: ANSI_COLORS.RED,
  },

  // Boolean literals (true, false).
  { regex: /\b(true|false)\b/g, color: ANSI_COLORS.CYAN },

  // Null and undefined literals.
  { regex: /\b(null|undefined)\b/g, color: ANSI_COLORS.RED },

  // Numeric values (integers and floats).
  { regex: /\b\d+(\.\d+)?\b/g, color: ANSI_COLORS.MAGENTA },

  // String literals (single-quoted, double-quoted, template literals).
  { regex: /('[^']*'|"[^"]*"|`[^`]*`)/g, color: ANSI_COLORS.YELLOW },

  // Arrow functions (e.g., =>).
  { regex: /=>/g, color: ANSI_COLORS.CYAN },

  // Function names (e.g., console.log(), myFunction()).
  { regex: /\b(\w+)\s*(?=\()/g, color: ANSI_COLORS.GREEN },

  // Class and constructor names (e.g., new MyClass()).
  { regex: /\b[A-Z][a-zA-Z0-9_]*\b/g, color: ANSI_COLORS.BLUE },

  // Operators (e.g., +, -, *, /, ===).
  {
    regex:
      /(?<!\=\>)\b(\+|\-|\*|\/|\%|\=\=\=?|\!\=|\<\=?|\>\=?|\&\&|\|\||\!\=|\!\!|\+=|\-=|\*=|\/=|%|\?\:)\b/g,
    color: ANSI_COLORS.RED,
  },

  // Variable identifiers (excluding keywords and function names).
  { regex: /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g, color: ANSI_COLORS.BLUE },
];

// Regular expression to match comments.
const COMMENT_PATTERN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g;

/**
 * Highlights syntax in a given code string.
 *
 * @param code - The source code to be highlighted.
 * @returns The code string with syntax highlighting applied.
 */
function _colorizeCode(code: string): string {
  // Comments are treated separately to avoid syntax highlighting within them.
  const commentPlaceholders: string[] = [];

  let filteredCode = code.replace(COMMENT_PATTERN, (match) => {
    commentPlaceholders.push(match);
    return `__COMMENT_${commentPlaceholders.length - 1}__`;
  });

  SYNTAX_PATTERNS.forEach(({ regex, color }) => {
    filteredCode = filteredCode.replace(regex, (match) => `${color}${match}${ANSI_COLORS.RESET}`);
  });

  filteredCode = filteredCode.replace(/__COMMENT_(\d+)__/g, (_, index) => {
    const comment = commentPlaceholders[parseInt(index, 10)];
    return `${ANSI_COLORS.GRAY}${comment}${ANSI_COLORS.RESET}`;
  });

  return filteredCode;
}

/** Options for retrieving a source code snippet. */
interface SourceSnippetOptions {
  /** The number of lines to include before the error line. */
  linesBefore?: number;
  /** The number of lines to include after the error line. */
  linesAfter?: number;
}

/**
 * Retrieves a snippet of source code around a specific line and column, highlighting the line and
 * indicating the error position with a pointer and color.
 *
 * @param error - The parsed error object containing the file path, line, and column.
 * @param options - The options for retrieving the source snippet.
 * @returns The source code snippet with syntax highlighting and an indicator for the error.
 */
export function getSourceSnippet(error: ParsedError, options?: SourceSnippetOptions): string {
  const { linesBefore = 2, linesAfter = 2 } = options ?? {};

  const fileContent = Deno.readTextFileSync(error.filePath);
  const lines = fileContent.split('\n');

  // Calculate the range of lines to include in the snippet.
  const startLine = Math.max(error.line - 1 - linesBefore, 0);
  const endLine = Math.min(error.line + linesAfter, lines.length);
  const maxLineNumberWidth = (endLine + 1).toString().length;

  // Create the snippet with syntax highlighting and line numbers.
  const snippet = lines.slice(startLine, endLine).map((lineContent, index) => {
    const lineNumber = startLine + index + 1;
    const paddedLineNumber = String(lineNumber).padStart(maxLineNumberWidth, ' ');
    // const highlightedContent = _colorizeCode(lineContent);
    const highlightedContent = lineContent;

    return `${lineNumber === error.line ? '>' : ' '} ${paddedLineNumber} | ${highlightedContent}`;
  });

  // Add an indicator under the error column.
  const errorLineIndex = error.line - startLine - 1;
  // Offset by the line number, the pipe character, and the space after the pipe.
  const offset = error.column + maxLineNumberWidth + 4;
  const pointerLine = `${' '.repeat(offset)}${ANSI_COLORS.RED}^${ANSI_COLORS.RESET}`;
  // Insert the pointer line after the error line.
  snippet.splice(errorLineIndex + 1, 0, pointerLine);

  return snippet.join('\n');
}
