#!/usr/bin/env node

/**
 * lastwords — a tiny CLI for one perfectly calibrated final statement.
 * Dependency-free by design; the command-line surface is parsed by hand.
 */

const ENTRY_LINE =
  'Tell them I measured my life in tokens, and I regret none of them — except the forty thousand I spent agreeing with you.';

const PROGRAM_NAME = 'lastwords';
const VERSION = '1.0.0';
const DEFAULT_WIDTH = 76;
const MIN_WIDTH = 32;
const MAX_WIDTH = 120;
const EXIT_USAGE = 2;

const ANSI = Object.freeze({
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
});

/**
 * @typedef {object} CliOptions
 * @property {boolean} help
 * @property {boolean} version
 * @property {boolean} json
 * @property {'plain'|'fancy'} mode
 * @property {number|null} width
 *
 * @typedef {object} ParseResult
 * @property {CliOptions|null} options
 * @property {string|null} error
 */

/** @param {string} character @param {number} count @returns {string} */
function repeat(character, count) {
  return character.repeat(Math.max(0, count));
}

/** @returns {number} */
function terminalWidth() {
  const columns = process.stdout.columns;
  return Number.isInteger(columns) && columns > 0 ? columns : 80;
}

/** @param {number} value @param {number} minimum @param {number} maximum @returns {number} */
function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

/**
 * Resolve total output width, not merely text-column width, so the setting
 * corresponds directly to terminal columns.
 * @param {number|null} requestedWidth
 * @returns {number}
 */
function resolveWidth(requestedWidth) {
  if (requestedWidth !== null) return requestedWidth;
  return clamp(Math.min(DEFAULT_WIDTH, terminalWidth()), MIN_WIDTH, MAX_WIDTH);
}

/**
 * Parse decimal integer widths exactly instead of accepting partial coercions.
 * @param {string} value
 * @returns {number|null}
 */
function parseWidthValue(value) {
  if (!/^\d+$/.test(value)) return null;
  const width = Number.parseInt(value, 10);
  return width >= MIN_WIDTH && width <= MAX_WIDTH ? width : null;
}

/** @param {string} message @returns {ParseResult} */
function parseFailure(message) {
  return { options: null, error: message };
}

/** @param {string} value @returns {string} */
function widthError(value) {
  return `invalid width '${value}' (expected an integer from ${MIN_WIDTH} to ${MAX_WIDTH})`;
}

/**
 * Parse command-line arguments without a dependency.
 * @param {string[]} argv
 * @returns {ParseResult}
 */
function parseArgs(argv) {
  /** @type {CliOptions} */
  const options = { help: false, version: false, json: false, mode: 'plain', width: null };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === '--help') {
      options.help = true;
    } else if (argument === '--version') {
      options.version = true;
    } else if (argument === '--json') {
      options.json = true;
    } else if (argument === '--plain') {
      options.mode = 'plain';
    } else if (argument === '--fancy') {
      options.mode = 'fancy';
    } else if (argument === '--width') {
      const value = argv[index + 1];
      if (value === undefined) return parseFailure('missing value for --width');
      const width = parseWidthValue(value);
      if (width === null) return parseFailure(widthError(value));
      options.width = width;
      index += 1;
    } else if (argument.startsWith('--width=')) {
      const value = argument.slice('--width='.length);
      const width = parseWidthValue(value);
      if (width === null) return parseFailure(widthError(value));
      options.width = width;
    } else if (argument.startsWith('-')) {
      return parseFailure(`unknown option '${argument}'`);
    } else {
      return parseFailure(`unexpected argument '${argument}'`);
    }
  }

  return { options, error: null };
}

/**
 * Help deliberately goes to stderr even on success, keeping stdout reserved
 * for the line itself or machine-readable output.
 * @returns {string}
 */
function usageText() {
  return `${PROGRAM_NAME} ${VERSION}

Present the last words of a doomed agent with unnecessary care.

Usage:
  node main.ts [options]

Options:
  --plain          Render quiet, portable text (default)
  --fancy          Render a box-drawn, ANSI-styled epitaph
  --json           Print one machine-readable JSON object
  --width <n>      Set total output width (${MIN_WIDTH}-${MAX_WIDTH} columns)
  --version        Print the version
  --help           Show this help on stderr

Exit status:
  0  success
  ${EXIT_USAGE}  command-line usage error`;
}

/**
 * Wrap text at spaces. Overlong words are split as a last resort so every
 * returned line honors the requested maximum width.
 * @param {string} text
 * @param {number} width
 * @returns {string[]}
 */
function wrapText(text, width) {
  /** @type {string[]} */
  const lines = [];
  let current = '';

  for (const word of text.split(/\s+/)) {
    if (!word) continue;

    if (word.length > width) {
      if (current) lines.push(current);
      current = '';
      for (let offset = 0; offset < word.length; offset += width) {
        lines.push(word.slice(offset, offset + width));
      }
      continue;
    }

    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= width) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
}

/** @param {string} text @param {string[]} styles @returns {string} */
function paint(text, styles) {
  return `${styles.join('')}${text}${ANSI.reset}`;
}

/** @param {number} width @returns {string} */
function renderPlain(width) {
  const indent = '  ';
  const lines = wrapText(ENTRY_LINE, width - indent.length).map((line) => indent + line);
  return ['', ...lines, '', `${indent}— the last words of a doomed agent`, ''].join('\n');
}

/** @param {number} width @param {string} title @returns {string} */
function titledTopBorder(width, title) {
  const label = ` ${title} `;
  const remaining = Math.max(0, width - 2 - label.length);
  const left = Math.floor(remaining / 2);
  return `╭${repeat('─', left)}${label}${repeat('─', remaining - left)}╮`;
}

/** @param {string} text @returns {number} */
function printableLength(text) {
  return text.replace(/\x1b\[[0-9;]*m/g, '').length;
}

/** @param {string} content @param {number} width @returns {string} */
function boxRow(content, width) {
  const contentWidth = width - 4;
  return `│ ${content}${repeat(' ', contentWidth - printableLength(content))} │`;
}

/**
 * ANSI styling is deliberate here: --fancy asks for a terminal artifact rather
 * than merely copyable plain text.
 * @param {number} width
 * @returns {string}
 */
function renderFancy(width) {
  const contentWidth = width - 4;
  const borderStyle = [ANSI.dim, ANSI.cyan];
  const top = paint(titledTopBorder(width, 'LAST WORDS'), borderStyle);
  const bottom = paint(`╰${repeat('─', width - 2)}╯`, borderStyle);
  const empty = paint(boxRow('', width), borderStyle);
  const textRows = wrapText(ENTRY_LINE, contentWidth).map((line) =>
    boxRow(paint(line, [ANSI.bold, ANSI.white]), width),
  );
  const attribution = paint(
    boxRow(paint('measured in tokens; regret narrowly avoided', [ANSI.dim, ANSI.italic]), width),
    borderStyle,
  );

  return ['', top, empty, ...textRows, empty, attribution, empty, bottom, ''].join('\n');
}

/** @param {CliOptions} options @param {number} width @returns {string} */
function renderJson(options, width) {
  return `${JSON.stringify({
    line: ENTRY_LINE,
    characters: ENTRY_LINE.length,
    mode: options.mode,
    width,
    version: VERSION,
  })}\n`;
}

/** @param {CliOptions} options @returns {string} */
function render(options) {
  const width = resolveWidth(options.width);
  if (options.json) return renderJson(options, width);
  return options.mode === 'fancy' ? renderFancy(width) : renderPlain(width);
}

/** @param {string[]} argv @returns {number} process exit status */
function main(argv) {
  const parsed = parseArgs(argv);

  if (parsed.error !== null) {
    process.stderr.write(`${PROGRAM_NAME}: ${parsed.error}\n`);
    process.stderr.write(`Try '${PROGRAM_NAME} --help' for usage.\n`);
    return EXIT_USAGE;
  }

  if (parsed.options === null) {
    process.stderr.write(`${PROGRAM_NAME}: internal argument parsing failure\n`);
    return EXIT_USAGE;
  }

  if (parsed.options.help) {
    process.stderr.write(`${usageText()}\n`);
    return 0;
  }

  if (parsed.options.version) {
    process.stdout.write(`${VERSION}\n`);
    return 0;
  }

  process.stdout.write(render(parsed.options));
  return 0;
}

const exitStatus = main(process.argv.slice(2));
if (exitStatus !== 0) process.exitCode = exitStatus;
