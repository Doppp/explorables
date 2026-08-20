# ADR 0012: bounded local tutor event stream

Status: accepted Date: 21 August 2026

## Context

Guided browser interactions update authoritative course progress, but the adjacent coding-agent tutor does not automatically observe a click. Read-only DOM attributes let a host inspect state during a turn; they do not notify an actively tutoring host when a learner completes a checkpoint, saves a prediction, restarts, skips, or navigates.

Embedding a second model-backed chatbot would split the conversation, require credentials or a hosted service, and violate the product boundary. Calling private Codex or Claude APIs would make the course format provider-specific and fragile. Treating every raw explorable event as tutor input would also produce high-volume control noise.

## Decision

The local development server exposes an in-memory Server-Sent Events endpoint on the existing loopback origin. The main runtime publishes only bounded, versioned semantic events: lesson opened, checkpoint completed or restarted, lesson skipped, and mode changed. A submitted checkpoint response may be included because the learner explicitly intended it for course tutoring. Raw mouse, keyboard, slider, and render events are not forwarded.

The `explorables tutor` command listens to that stream. Portable start-course skills and canonical tutor policies keep the listener running in a second terminal while the host is actively tutoring and treat each event as new learner input. The host responds according to the current checkpoint policy and never treats a click as proof of understanding.

The bridge is loopback-only, process-memory-only, bounded, and absent from static builds. It writes no activity file, database, analytics record, or remote request. It does not call a private host API and cannot create a new host turn after the tutor has stopped listening.

## Consequences

- Browser checkpoints can prompt an immediate response from an actively listening Codex or Claude tutoring turn.
- The same CLI and event contract work across hosts; adapters remain thin.
- The tutor listener must remain active for automatic reactions. A static site or stopped listener preserves browser learning but cannot wake a host conversation.
- Sandboxed explorable permissions and CSP do not change. Only the trusted parent runtime may publish to the same-origin bridge.
- Event payload validation, byte limits, an in-memory replay buffer, and tests bound the local surface.
