import { resolve } from '@std/path/resolve';
import { basename } from '@std/path/basename';
import { relative } from '@std/path/relative';
import { TextLineStream } from '@std/streams/text-line-stream';
import AsciiTable from './_ascii_table.ts';

/**
 * @description rough range object class with a small helper method.
 * Note that there is no validation on the to/from values.
 */
class Range {
  constructor(
    public from = -Infinity,
    public to = -Infinity,
  ) {
  }

  toString(): string {
    if (this.from === this.to && this.from === -Infinity) return 'N/A';
    if (this.from === this.to) return '' + this.from;
    return `${this.from}-${this.to}`;
  }
}

class FileCoverage {
  lines = new Map<number, number>();
  linesFound = 0;
  linesHit = 0;

  get untouchedLines(): number[] {
    return Array
      .from(this.lines.entries())
      .filter((v) => v[1] === 0)
      .map((v) => v[0]);
  }

  constructor(public readonly name: string) {}

  addLines(lineNumber: number, hitCount: number): typeof this {
    const currentHitCount = this.lines.get(lineNumber) ?? 0;
    this.lines.set(lineNumber, currentHitCount + hitCount);
    return this;
  }

  setLinesHit(count: number): typeof this {
    this.linesHit = count;
    return this;
  }

  setLinesFound(count: number): typeof this {
    this.linesFound = count;
    return this;
  }

  get missingCoverage(): string {
    const ranges: Range[] = [
      new Range(),
    ];

    const orderedLines = Array
      .from(this.lines.entries())
      .sort((a, b) => a[0] - b[0]);

    for (let i = 0; i < orderedLines.length; i++) {
      const recent = ranges.at(-1) as Range;
      if (orderedLines[i][1] === 0 && recent.from === -Infinity) {
        recent.from = recent.to = orderedLines[i][0];
      } else if (orderedLines[i][1] === 0 && orderedLines[i - 1][1] > 0) {
        ranges.push(new Range(orderedLines[i][0], orderedLines[i][0]));
      } else if (orderedLines[i][1] === 0) { // && orderedLines[i-1][1] === 0
        recent.to = orderedLines[i][0];
      } else {
        // orderedLines[i][1] > 0
      }
    }

    return ranges.map((v) => v.toString()).join(', ');
  }

  parseRawLine(line: string): typeof this {
    if (line.startsWith('DA:')) {
      line = line.replace('DA:', '');
      const [lineNum, takeCount] = line.split(',').map((v) => Number(v));
      this.addLines(lineNum, takeCount);
    }

    if (/^L[FH]:/.test(line)) {
      const [type, val] = line.split(':');
      if (type === 'LF') this.setLinesFound(Number(val));
      else this.setLinesHit(Number(val));
    }

    return this;
  }
}

export class ProjectCoverage {
  linesFound = 0;
  linesHit = 0;

  fileCoverages = new Set<FileCoverage>();
  #table = new AsciiTable();
  #totalHasBeenAdded = false;

  constructor(public name: string = basename(resolve('.'))) {
    this.#table.setHeading('File Path', 'Coverage', 'Lines Without Coverage');
  }

  addFileCoverage(...fcs: FileCoverage[]): typeof this {
    const cwd = Deno.cwd();
    for (const fc of fcs) {
      this.fileCoverages.add(fc);
      this.linesFound += fc.linesFound;
      this.linesHit += fc.linesHit;
      this.#table.addRow(
        relative(cwd, fc.name),
        `${(fc.linesHit / fc.linesFound * 100).toFixed(2)}%`,
        fc.missingCoverage,
      );
    }
    return this;
  }

  printTable(): void {
    if (!this.#totalHasBeenAdded) {
      this.#totalHasBeenAdded = true;
      this.#table.addRow(
        'Totals:',
        `${(this.linesHit / this.linesFound * 100).toFixed(2)}%`,
      );
    }
    console.log(this.#table.toString());
  }
}

const recordStart = /^SF:/;

async function processLcovFile(
  readableStream: ReadableStream<Uint8Array>,
): Promise<ProjectCoverage> {
  let currentFile: FileCoverage | null = null;

  const projectCoverage = new ProjectCoverage();

  const lineStream = readableStream
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());

  /**
   * Iterate over the file -- these could be long and keeping the whole text may not be an option,
   * so instead we go line by line since the lcov format has a fairly line-readable setup.
   */
  // @ts-expect-error Expected for some reason
  for await (const line of lineStream) {
    if (recordStart.test(line)) {
      currentFile = new FileCoverage(line.replace('SF:', ''));
    }

    if (currentFile && line === 'end_of_record') {
      projectCoverage.addFileCoverage(currentFile);
    }

    currentFile?.parseRawLine(line);
  }
  return projectCoverage;
}

const coverage = new Deno.Command('deno', {
  args: ['coverage', '--lcov', '--output=.coverage/lcov.info', '.coverage'],
});

await coverage.output();

const file = await Deno.open(resolve('.coverage/lcov.info'));

const projectCoverage = await processLcovFile(file.readable);

projectCoverage.printTable();
