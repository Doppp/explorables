# ADR 0008: local discovery cycles and experiment records

Status: accepted Date: 17 August 2026

## Context

The existing guided sequence asks learners to predict, manipulate, implement, and explain, but learner checkpoints record only acknowledgment. Explorable events also disappear after completing a checkpoint, so learners cannot compare their expectation with evidence from multiple runs.

Explorable explanations are strongest when readers can inspect and challenge a computational claim. Nicky Case's complementary patterns emphasize Do/Show/Tell, See/Model/Apply, cognitive gates, and experiences that are author-guided while remaining player-driven.

## Decision

Add an opt-in discovery-cycle profile at course or lesson scope. A discovery cycle declares ordered `predict`, `experiment`, `apply`, and `reflect` checkpoint phases. Prediction and reflection checkpoints capture bounded local text; experiment checkpoints complete only from a structured `experiment-recorded` event.

The explorable SDK gains `recordExperiment`, which accepts bounded scalar input and output fields. The sandbox carries that record through the existing local event protocol. The parent validates, timestamps, limits, persists, and renders the evidence. Sandboxed course code receives no storage, network, same-origin, or main-document access.

Guided state advances to schema version 2 and migrates valid version-1 progress. Restart and reset semantics apply to responses and evidence as well as checkpoint completion. Records remain browser-local, course-version-scoped, resettable, ungraded, and unavailable as assessment or analytics evidence.

No new Markdown directive is introduced. Ordinary prose still carries hooks, formal explanations, and transfer prompts.

## Consequences

- Existing courses and lessons remain valid without opting in.
- Authors can pilot discovery lessons before enabling the profile course-wide.
- Runtime comparison is generic; domain-specific calculations and controls stay inside each explorable.
- A bounded scalar record is intentionally less expressive than arbitrary JSON, making comparison, validation, storage limits, and accessible rendering clear.
- Automated validation can prove structural sequence, not pedagogical quality. Human playtesting remains required before rolling the profile through a course.

## References

- Bret Victor, [Explorable Explanations](https://worrydream.com/ExplorableExplanations/)
- Nicky Case, [Explorable Explanations](https://blog.ncase.me/explorable-explanations/)
