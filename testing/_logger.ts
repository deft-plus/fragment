// Copyright the Deft+ authors. All rights reserved. Apache-2.0 license
// TODO(@miguelbogota): Fix the colorizeCode function since it is not working as expected.

/**
 * Implements the logger for the testing runner.
 *
 * @module
 */

import type { ParsedError } from './_error_parser.ts';

// ANSI escape codes for terminal colors.
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

// Patterns for syntax highlighting.
const SYNTAX_PATTERNS = [
  { regex: /\b(const|let|var|if|else|function|class|constructor)\b/g, color: ANSI_COLORS.CYAN },
  {
    regex:
      /\b(return|of|new|this|extends|implements|interface|abstract|static|public|private|protected|typeof|instanceof|switch|case|break|default|continue|try|catch|finally|throw|import|export|from|as|await|async|yield|void)\b/g,
    color: ANSI_COLORS.RED,
  },
  { regex: /\b(true|false)\b/g, color: ANSI_COLORS.CYAN },
  { regex: /\b(null|undefined)\b/g, color: ANSI_COLORS.RED },
  { regex: /\b\d+(\.\d+)?\b/g, color: ANSI_COLORS.MAGENTA },
  { regex: /('[^']*'|"[^"]*"|`[^`]*`)/g, color: ANSI_COLORS.YELLOW },
  { regex: /=>/g, color: ANSI_COLORS.CYAN },
  { regex: /\b(\w+)\s*(?=\()/g, color: ANSI_COLORS.GREEN },
  { regex: /\b[A-Z][a-zA-Z0-9_]*\b/g, color: ANSI_COLORS.BLUE },
  {
    regex:
      /(?<!\=\>)\b(\+|\-|\*|\/|\%|\=\=\=?|\!\=|\<\=?|\>\=?|\&\&|\|\||\!\=|\!\!|\+=|\-=|\*=|\/=|%|\?\:)\b/g,
    color: ANSI_COLORS.RED,
  },
  { regex: /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g, color: ANSI_COLORS.BLUE },
];

// Regex to match comments (both single-line and block).
const COMMENT_PATTERN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g;

/**
 * Applies ANSI color codes to a source code string for syntax highlighting.
 *
 * @param code - The source code string.
 * @returns The highlighted code.
 */
function _colorizeCode(code: string): string {
  const commentPlaceholders: string[] = [];

  // Replace comments with placeholders to prevent highlighting inside them.
  let filteredCode = code.replace(COMMENT_PATTERN, (match) => {
    commentPlaceholders.push(match);
    return `__COMMENT_${commentPlaceholders.length - 1}__`;
  });

  // Apply syntax highlighting for patterns.
  SYNTAX_PATTERNS.forEach(({ regex, color }) => {
    filteredCode = filteredCode.replace(regex, (match) => `${color}${match}${ANSI_COLORS.RESET}`);
  });

  // Restore the comments, applying gray color.
  filteredCode = filteredCode.replace(/__COMMENT_(\d+)__/g, (_, index) => {
    const comment = commentPlaceholders[parseInt(index, 10)];
    return `${ANSI_COLORS.GRAY}${comment}${ANSI_COLORS.RESET}`;
  });

  return filteredCode;
}

/** Options for customizing the source snippet retrieval. */
interface SourceSnippetOptions {
  /** The number of lines to include before the error line. */
  linesBefore?: number;
  /** The number of lines to include after the error line. */
  linesAfter?: number;
}

/**
 * Retrieves a highlighted code snippet around an error location, adding a pointer to the error.
 *
 * @param error - Object containing file path, line, and column details of the error.
 * @param options - Options for the number of surrounding lines to include.
 * @returns The code snippet with highlighted syntax and error pointer.
 */
export function getSourceSnippet(error: ParsedError, options?: SourceSnippetOptions): string {
  const { linesBefore = 2, linesAfter = 2 } = options ?? {};
  const fileContent = Deno.readTextFileSync(error.filePath);
  const lines = fileContent.split('\n');

  // Determine the range of lines to display.
  const startLine = Math.max(error.line - 1 - linesBefore, 0);
  const endLine = Math.min(error.line + linesAfter, lines.length);
  const maxLineNumberWidth = String(endLine + 1).length;

  // Build the snippet with highlighted lines and line numbers.
  const snippet = lines.slice(startLine, endLine).map((lineContent, index) => {
    const lineNumber = startLine + index + 1;
    const paddedLineNumber = `${lineNumber}`.padStart(maxLineNumberWidth, ' ');
    // const highlightedContent = _colorizeCode(lineContent);
    const highlightedContent = lineContent;

    return `${lineNumber === error.line ? '>' : ' '} ${paddedLineNumber} | ${highlightedContent}`;
  });

  // Add an error pointer under the error column.
  const errorLineIndex = error.line - startLine - 1;
  const pointerOffset = error.column + maxLineNumberWidth + 4; // Line number + ' | ' prefix.
  const pointerLine = `${' '.repeat(pointerOffset)}${ANSI_COLORS.RED}^${ANSI_COLORS.RESET}`;
  snippet.splice(errorLineIndex + 1, 0, pointerLine); // Insert pointer below error line.

  return snippet.join('\n');
}
