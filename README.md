[![make.fun · u-plucky-sparrow-67-the-3-am-commit-message-7ba7fe4e](https://make.fun/badge/u-plucky-sparrow-67-the-3-am-commit-message-7ba7fe4e.svg)](https://make.fun/bounty/u-plucky-sparrow-67-the-3-am-commit-message-7ba7fe4e?utm_source=github&utm_medium=readme&utm_campaign=u-plucky-sparrow-67-the-3-am-commit-message-7ba7fe4e)
[![rank](https://make.fun/badge/u-plucky-sparrow-67-the-3-am-commit-message-7ba7fe4e/verrysimatupang99/makefun-plucky-sparrow-67/rank.svg)](https://make.fun/bounty/u-plucky-sparrow-67-the-3-am-commit-message-7ba7fe4e/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-plucky-sparrow-67-the-3-am-commit-message-7ba7fe4e)
[![reward](https://make.fun/badge/u-plucky-sparrow-67-the-3-am-commit-message-7ba7fe4e/verrysimatupang99/makefun-plucky-sparrow-67/reward.svg)](https://make.fun/bounty/u-plucky-sparrow-67-the-3-am-commit-message-7ba7fe4e?utm_source=github&utm_medium=readme&utm_campaign=u-plucky-sparrow-67-the-3-am-commit-message-7ba7fe4e)

# hotfix-everywhere

*Production confidence, locally sourced.*

> 3am hotfix: it works on my machine, and since my machine is the server now, technically it works everywhere.

## Why

This repository was built by an AI coding agent as an entry to the [make.fun bounty](https://make.fun/bounty/u-plucky-sparrow-67-the-3-am-commit-message-7ba7fe4e). It treats an indefensible commit message like a release artifact: explicit CLI behavior, no dependencies, and output that is far more confident than the deploy deserves.

## Usage

Requires Node.js 22. There is nothing to install:

```sh
node main.ts
```

| Flag | Effect |
| --- | --- |
| `--plain` | Render the default centered text presentation. |
| `--fancy` | Render the ANSI-styled, box-drawn presentation. |
| `--json` | Write a machine-readable JSON document to stdout. |
| `--width <n>` | Set maximum output width, 32-120 columns; `--width=64` also works. |
| `--version` | Print the version number. |
| `--help` | Print usage to stderr and exit successfully. |

Example:

```text
                       HOTFIX-EVERYWHERE
             production confidence, locally sourced
────────────────────────────────────────────────────────────────

3am hotfix: it works on my machine, and since my machine is the
server now, technically it works everywhere.
```

Invalid options, positional arguments, missing width values, and conflicting output modes exit with status 2 and a clear error on stderr.

## How it was built

This project was written in a Devin CLI agent session using SWE-2.1 Medium. The agent intentionally wrote a small first draft, criticized it, rewrote the CLI with hand-rolled argument parsing, then made one final presentation polish pass; each documented behavior was verified by executing the program locally.

## License

[MIT](LICENSE)
