#!/usr/bin/env node

/**
 * hotfix-everywhere — a dependency-free presentation layer for one
 * indestructible deployment truth: production is just somebody else's localhost.
 */

const PROGRAM_NAME = 'hotfix-everywhere';
const VERSION = '1.0.0';
const ENTRY_LINE =
  '3am hotfix: it works on my machine, and since my machine is the server now, technically it works everywhere.';
const TAGLINE = 'production confidence, locally sourced';
const DEFAULT_WIDTH = 76;
const MIN_WIDTH = 32;
const MAX_WIDTH = 120;

/** @typedef {'plain' | 'fancy'} OutputFormat */
/**
 * @typedef {object} CliOptions
 * @property {OutputFormat} format
 * @property {boolean} json
 * @property {boolean} help
 * @property {boolean} version
 * @property {number | undefined} width
 */

class UsageError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = 'UsageError';
  }
}

/**
 * @param {string} text
 * @param {number[]} codes
 * @returns {string}
 */
function styled(text, codes) {
  return `\u001b[${codes.join(';')}m${text}\u001b[0m`;
}

/** @type {(text: string) => string} */
const bold = (text) => styled(text, [1]);
/** @type {(text: string) => string} */
const dim = (text) => styled(text, [2]);
/** @type {(text: string) => string} */
const yellow = (text) => styled(text, [33]);
/** @type {(text: string) => string} */
const cyan = (text) => styled(text, [36]);

/**
 * @param {string} rawValue
 * @returns {number}
 */
function parseWidth(rawValue) {
  if (!/^\d+$/.test(rawValue)) {
    throw new UsageError(`invalid width "${rawValue}": expected a positive integer`);
  }
  const width = Number.parseInt(rawValue, 10);
  if (width < MIN_WIDTH || width > MAX_WIDTH) {
    throw new UsageError(`invalid width "${rawValue}": expected ${MIN_WIDTH}-${MAX_WIDTH}`);
  }
  return width;
}

/**
 * Parse arguments deliberately: no framework, no implicit positional input,
 * and no silent acceptance of misspelled flags.
 *
 * @param {string[]} args
 * @returns {CliOptions}
 */
function parseArgs(args) {
  /** @type {CliOptions} */
  const options = { format: 'plain', json: false, help: false, version: false, width: undefined };
  let formatWasSet = false;
  let widthWasSet = false;

  /** @param {OutputFormat} format */
  const setFormat = (format) => {
    if (formatWasSet && options.format !== format) {
      throw new UsageError('choose either --plain or --fancy, not both');
    }
    options.format = format;
    formatWasSet = true;
  };

  /** @param {string} rawValue */
  const setWidth = (rawValue) => {
    if (widthWasSet) throw new UsageError('--width may only be provided once');
    options.width = parseWidth(rawValue);
    widthWasSet = true;
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--help') options.help = true;
    else if (arg === '--version') options.version = true;
    else if (arg === '--json') options.json = true;
    else if (arg === '--plain') setFormat('plain');
    else if (arg === '--fancy') setFormat('fancy');
    else if (arg === '--width') {
      index += 1;
      if (index >= args.length) throw new UsageError('--width requires a value');
      setWidth(args[index]);
    } else if (arg.startsWith('--width=')) {
      const rawValue = arg.slice('--width='.length);
      if (rawValue === '') throw new UsageError('--width requires a value');
      setWidth(rawValue);
    } else if (arg.startsWith('-')) {
      throw new UsageError(`unknown option "${arg}"`);
    } else {
      throw new UsageError(`unexpected argument "${arg}"`);
    }
  }

  return options;
}

/**
 * @returns {string}
 */
function usageText() {
  return `${PROGRAM_NAME} ${VERSION}

Usage:
  node main.ts [options]

Options:
  --plain          Render a clean text presentation (default)
  --fancy          Render an ANSI-styled, box-drawn presentation
  --json           Emit a machine-readable JSON document
  --width <n>      Set the maximum output width, ${MIN_WIDTH}-${MAX_WIDTH} columns
  --version        Print the version number
  --help           Show this help message on stderr

Examples:
  node main.ts
  node main.ts --fancy --width 64
  node main.ts --json
`;
}

/**
 * Greedy word wrapping with hard breaks for pathological long words.
 *
 * @param {string} text
 * @param {number} width
 * @returns {string[]}
 */
function wrapText(text, width) {
  const lines = [];
  let current = '';

  for (const originalWord of text.split(/\s+/).filter(Boolean)) {
    let word = originalWord;
    if (word.length > width) {
      if (current !== '') {
        lines.push(current);
        current = '';
      }
      const pieces = [];
      for (let start = 0; start < word.length; start += width) {
        pieces.push(word.slice(start, start + width));
      }
      lines.push(...pieces.slice(0, -1));
      word = pieces[pieces.length - 1];
    }

    const candidate = current === '' ? word : `${current} ${word}`;
    if (candidate.length <= width) current = candidate;
    else {
      lines.push(current);
      current = word;
    }
  }

  if (current !== '') lines.push(current);
  return lines;
}

/**
 * @param {string} text
 * @param {number} width
 * @returns {string}
 */
function centered(text, width) {
  if (text.length >= width) return text;
  const remaining = width - text.length;
  const left = Math.floor(remaining / 2);
  return `${' '.repeat(left)}${text}${' '.repeat(remaining - left)}`;
}

/**
 * Explicit widths win. Otherwise use a conservative terminal-derived width,
 * falling back to a stable value when stdout is redirected.
 *
 * @param {CliOptions} options
 * @returns {number}
 */
function resolveWidth(options) {
  if (options.width !== undefined) return options.width;
  const columns = process.stdout.columns;
  if (typeof columns === 'number' && Number.isFinite(columns) && columns > 0) {
    return Math.min(DEFAULT_WIDTH, Math.max(MIN_WIDTH, columns - 4));
  }
  return DEFAULT_WIDTH;
}

/** @param {number} width @returns {string} */
function renderPlain(width) {
  const header = [PROGRAM_NAME.toUpperCase(), ...wrapText(TAGLINE, width)]
    .map((line) => centered(line, width).trimEnd());
  return [
    ...header, '─'.repeat(width), '',
    ...wrapText(ENTRY_LINE, width), '',
  ].join('\n');
}

/**
 * @param {string} content
 * @param {number} innerWidth
 * @param {(text: string) => string} style
 * @returns {string}
 */
function renderBoxLine(content, innerWidth, style) {
  return `${cyan('│')} ${style(content.padEnd(innerWidth, ' '))} ${cyan('│')}`;
}

/**
 * @param {number} width
 * @returns {string}
 */
function renderFancy(width) {
  const innerWidth = width - 4;
  const horizontal = '─'.repeat(innerWidth + 2);
  const emptyLine = renderBoxLine('', innerWidth, (text) => text);

  return [
    cyan(`╭${horizontal}╮`),
    renderBoxLine(centered('HOTFIX EVERYWHERE', innerWidth), innerWidth, (text) => bold(yellow(text))),
    ...wrapText(TAGLINE, innerWidth).map((line) => renderBoxLine(centered(line, innerWidth), innerWidth, dim)),
    emptyLine,
    ...wrapText(ENTRY_LINE, innerWidth).map((line) => renderBoxLine(line, innerWidth, bold)),
    cyan(`╰${horizontal}╯`),
    '',
  ].join('\n');
}

/**
 * @param {CliOptions} options
 * @param {number} width
 * @returns {string}
 */
function renderJson(options, width) {
  const contentWidth = options.format === 'fancy' ? width - 4 : width;
  const payload = {
    schemaVersion: 1,
    name: PROGRAM_NAME,
    version: VERSION,
    tagline: TAGLINE,
    line: ENTRY_LINE,
    output: {
      format: options.format,
      width,
      contentWidth,
      wrapped: wrapText(ENTRY_LINE, contentWidth),
    },
  };
  return `${JSON.stringify(payload, null, 2)}\n`;
}

/**
 * @param {CliOptions} options
 * @param {number} width
 * @returns {string}
 */
function render(options, width) {
  if (options.json) return renderJson(options, width);
  if (options.format === 'fancy') return renderFancy(width);
  return renderPlain(width);
}

/**
 * @param {UsageError} error
 * @returns {number}
 */
function reportUsageError(error) {
  process.stderr.write(`${PROGRAM_NAME}: ${error.message}\n`);
  process.stderr.write("Try 'node main.ts --help' for usage.\n");
  return 2;
}

/**
 * @param {string[]} args
 * @returns {number}
 */
function main(args) {
  try {
    const options = parseArgs(args);
    if (options.help) {
      process.stderr.write(usageText());
      return 0;
    }
    if (options.version) {
      process.stdout.write(`${VERSION}\n`);
      return 0;
    }
    process.stdout.write(render(options, resolveWidth(options)));
    return 0;
  } catch (error) {
    if (error instanceof UsageError) return reportUsageError(error);
    throw error;
  }
}

process.exitCode = main(process.argv.slice(2));
