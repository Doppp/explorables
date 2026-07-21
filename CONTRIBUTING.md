# Contributing

Thank you for improving `explorables`. By participating, follow the
`CODE_OF_CONDUCT.md` and licence your contribution under the repository terms.

## Local setup

Use Node.js 24 LTS and pnpm 11:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm site:build
pnpm course:build
```

Browser changes also require `pnpm test:browser` and `pnpm site:test` after
installing Playwright Chromium. Keep unrelated changes out of a pull request.

## Useful contribution shapes

- Runtime or validator fix with a regression test
- Explorable calculation, interaction, or accessibility improvement
- Focused exercise and deterministic tests
- Lesson correction with a cited primary source where facts are unstable
- Documentation, translation, or setup improvement

Course review checks accuracy, prediction/manipulation/implementation flow,
text fallback, keyboard and narrow-pane use, intentional failure quality,
licensing, and the tutor's protected paths. Explorable review additionally
checks model tests, mount/unmount cleanup, structured events, CSP compatibility,
and absence of network calls.

Do not add accounts, tracking, hosted execution, extra Markdown directives, a
visual editor, or general LMS features. Discuss material format/security
changes in an issue and record accepted departures from the PRD in an ADR.
