# Security policy

## Supported version

Security fixes target the latest v0.1 release and `master` until a broader
support policy is published.

## Threat model

Course modules are untrusted browser code. The runtime bundles them and runs
each in a separate iframe with `sandbox="allow-scripts"`, no same-origin
privilege, a restrictive CSP, and `connect-src 'none'`. A minimal validated
message protocol carries local events and errors. An iframe failure is isolated
from navigation and sibling lessons.

This browser boundary does not make dependency installation or exercise
execution safe. Package lifecycle scripts and commands can execute with the
learner's local permissions. First-party courses use the committed pnpm lock,
an explicit build allowlist, and reviewed dependencies. External compatible
courses are unreviewed; inspect their package files, lockfile, modules, and
exercise commands before installing or running them. Exercises never run merely
because a lesson opens.

The runtime has no accounts, secrets, analytics, backend, or remote learner
state. The landing page is static and sets no cookies.

## Report a vulnerability

Do not open a public issue for an exploitable vulnerability. Use GitHub's
private vulnerability reporting for `Doppp/explorables` with reproduction,
impact, affected commit/version, and any proposed mitigation. If private
reporting is unavailable, contact the repository owner through their public
GitHub profile and request a private channel.

We will acknowledge a report, reproduce it, coordinate a fix and disclosure,
and credit the reporter unless anonymity is requested. Never include real
secrets or third-party data in a report.
