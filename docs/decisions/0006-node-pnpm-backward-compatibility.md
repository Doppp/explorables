# ADR 0006: Node.js and pnpm backward compatibility

Status: accepted
Date: 15 August 2026

## Context

The original implementation treated Node.js 24 and pnpm 11 as exclusive
versions. That made the initial clean-checkout target unambiguous, but it also
rejected maintained installations that the current toolchain can support.
Node.js 22 remains an LTS release, and pnpm documents both majors 10 and 11 as
compatible with Node.js 22 and 24.

The committed dependency graph prevents a broader Node.js claim. In
particular, `jsdom@30.0.1` requires Node.js 22.22.2 or Node.js 24.15.0 at
minimum. Node.js 20 is end-of-life and is not a support target. The pnpm 9.0
lockfile format can be installed by pnpm 10 and 11.

## Decision

Keep Node.js 24 and pnpm 11 as the default development and GitHub Pages
deployment toolchain. Support these additional backward-compatible boundaries:

- Node.js 22 from 22.22.2 through the end of the 22.x line;
- pnpm 10.26.0 and newer 10.x releases, as well as pnpm 11.x. pnpm 10.26.0 is
  the first release with the workspace's `allowBuilds` setting.

The root `engines` field enforces those ranges. The former exact
`packageManager` field is removed because pnpm uses it to download and execute
pnpm 11 even when the user explicitly invokes pnpm 10; retaining it would make
pnpm 10 support nominal rather than real. GitHub Actions continues to pin pnpm
11.15.1 as the default. Compatibility CI installs the frozen lockfile and runs
the full check and build suite at the oldest supported Node major/pnpm major
pairing and the default pairing.

Support follows maintained Node.js LTS lines and is not extended to Node.js 20
or odd-numbered, end-of-life releases. A dependency upgrade that raises the
minimum patch version must update the engine range, CI matrix, documentation,
and this decision's consequences together.

## Consequences

- Learners and contributors can use maintained Node.js 22 environments and
  pnpm 10 without bypassing engine checks.
- Node.js 24/pnpm 11 remains the single default, avoiding ambiguous setup
  instructions and deployment drift.
- Backward compatibility is an exercised contract rather than an untested
  semver declaration.
- The supported Node.js 22 window ends when upstream Node.js support ends or a
  verified required dependency makes it infeasible; either change requires a
  new ADR.

## References

- https://nodejs.org/en/about/previous-releases
- https://pnpm.io/installation#compatibility
