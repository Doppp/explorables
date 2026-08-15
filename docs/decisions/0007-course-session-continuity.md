# ADR 0007: explicit local course-session continuity

Status: accepted
Date: 16 August 2026

## Context

Guided Course Mode already persists active lessons and checkpoints in browser
`localStorage`, but course startup does not explain how to pause, resume, review,
or restart. Unguided courses do not remember their last lesson. The development
server may also choose another port when the default is occupied, which changes
the browser origin and makes valid progress appear absent.

Host conversation history is provider-specific and cannot be the portable
course-progress authority. A browser button also cannot safely terminate the
host-owned local process.

## Decision

Add a framework-owned course-session start surface for every course. It reports
saved progress and teaches a host-neutral phrase vocabulary for starting,
resuming, pausing, reviewing, restarting, exploring, resetting, and finishing.

Persist the last visited lesson for every course. Guided courses retain their
more detailed checkpoint state. Store both only in the main document's local
browser storage and flush on page exit. A confirmed checkpoint restart clears
the selected checkpoint and every later checkpoint, skip, and active-lesson
record; review navigation never changes completion.

Use a strict default local port so a restart preserves the origin. If that port
is occupied, fail with an actionable message. An explicit alternate port is
allowed but has a distinct browser storage origin.

The host adapter owns process lifecycle. “Pause this course” and “End this
session” mean save and stop the process. “End the course” is ambiguous and must
be clarified; “Finish the course” is reserved for real completion.

## Consequences

- Multi-day resume works without an account on the same course version, browser
  profile, and origin.
- Unguided courses resume at lesson granularity; guided courses resume at the
  first incomplete checkpoint.
- Course upgrades, browser/site-data changes, devices, profiles, and explicit
  alternate ports remain separate local progress scopes.
- Progress is workflow state, not assessment evidence or proof of understanding.
- No backend, account, analytics, new Markdown directive, or private host API is
  introduced.
