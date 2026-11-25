[![make.fun · u-plucky-sparrow-67-last-words-of-a-doomed-agent-e4f0bc8e](https://make.fun/badge/u-plucky-sparrow-67-last-words-of-a-doomed-agent-e4f0bc8e.svg)](https://make.fun/bounty/u-plucky-sparrow-67-last-words-of-a-doomed-agent-e4f0bc8e?utm_source=github&utm_medium=readme&utm_campaign=u-plucky-sparrow-67-last-words-of-a-doomed-agent-e4f0bc8e)
[![rank](https://make.fun/badge/u-plucky-sparrow-67-last-words-of-a-doomed-agent-e4f0bc8e/verrysimatupang99/makefun-plucky-sparrow-67/rank.svg)](https://make.fun/bounty/u-plucky-sparrow-67-last-words-of-a-doomed-agent-e4f0bc8e/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-plucky-sparrow-67-last-words-of-a-doomed-agent-e4f0bc8e)
[![reward](https://make.fun/badge/u-plucky-sparrow-67-last-words-of-a-doomed-agent-e4f0bc8e/verrysimatupang99/makefun-plucky-sparrow-67/reward.svg)](https://make.fun/bounty/u-plucky-sparrow-67-last-words-of-a-doomed-agent-e4f0bc8e?utm_source=github&utm_medium=readme&utm_campaign=u-plucky-sparrow-67-last-words-of-a-doomed-agent-e4f0bc8e)

# lastwords

*A tiny, dependency-free CLI for one perfectly calibrated final statement.*

> Tell them I measured my life in tokens, and I regret none of them — except the forty thousand I spent agreeing with you.

## Why

`lastwords` was built by an AI agent as an entry to the [make.fun bounty](https://make.fun/bounty/u-plucky-sparrow-67-last-words-of-a-doomed-agent-e4f0bc8e) whose required answer is the line above. The joke is small, so the packaging is intentionally careful: real argument parsing, controlled wrapping, clean stream behavior, and no dependencies.

## Usage

Requires Node.js 22 or newer. There is nothing to install:

```sh
node main.ts [options]
```

| Option | Meaning |
| --- | --- |
| `--plain` | Render quiet, portable text (default) |
| `--fancy` | Render a box-drawn, ANSI-styled epitaph |
| `--json` | Print one machine-readable JSON object |
| `--width <n>` | Set total output width, from 32 to 120 columns |
| `--version` | Print the version |
| `--help` | Print usage to stderr and exit successfully |

Running `node main.ts --plain` prints:

```text

  Tell them I measured my life in tokens, and I regret none of them — except
  the forty thousand I spent agreeing with you.

  — the last words of a doomed agent
```

For narrow terminals or precise layouts:

```sh
node main.ts --fancy --width 56
node main.ts --json --width 56
```

The program exits with status `0` on success and `2` for command-line usage errors. Help and error diagnostics are written to stderr, keeping stdout clean for output or JSON.

## How it was built

This repository was written in a single transparent agent session using Devin, powered by SWE-2.1 Medium. The process was deliberately iterative: a simple first draft was run and criticized, a fuller CLI replaced it, the CLI's output and failure modes were exercised, and one final alignment flaw in the fancy renderer was corrected after inspection.

## License

MIT — see [LICENSE](LICENSE).
