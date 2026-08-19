# ADR 0010: General course library and display brand

Status: accepted

Date: 19 August 2026

## Context

The root collection home used the title “explorables Model-Learning Path,” promoted
the first AI course in its hero, and rendered every model-learning track as a numbered
part. That accurately described the repository's current curriculum but made the
entire product appear limited to AI. The same page gave planned courses nearly the
same visual weight as the only course a learner could open.

The existing PRD also required a lowercase wordmark everywhere. Learner feedback
interpreted that presentation as an accidental failure to capitalize a product name.
Changing package names, commands, URLs, filenames, or browser keys would create an
unnecessary compatibility migration.

## Decision

Present the root collection as a general, status-first course library. Its hero explains
the cross-subject learning model rather than one curriculum. Available courses appear
first with clear actions. Planned courses remain honest, non-interactive roadmap items
grouped by their course family. The model-learning curriculum remains valid but is
catalog content, not the identity of Explorables.

Use `Explorables` in visible UI, page titles, accessibility labels, marketing copy, and
natural-language product headings. Retain `explorables` for the CLI, npm scope,
repository and domain names, filenames, storage keys, protocol fields, data attributes,
and code identifiers.

This decision amends only the presentation decision in ADR 0005. The local allowlist,
collection schema, course routes, standalone course packages, security boundary, and
browser progress namespaces do not change.

## Consequences

- New subject areas can join the root library without rewriting its hero or navigation.
- A repository containing only one available subject remains honest about its current
  inventory without defining the product by that subject.
- Planned courses no longer compete visually with runnable courses and remain
  unfocusable until they become available.
- Existing commands, packages, links, saved progress, and integrations remain
  compatible because their lowercase identifiers do not change.
- Browser and site tests must distinguish the display brand from technical identifiers.
