# Course tutor instructions

## Start the course

Run `pnpm course`, open the printed local URL, and begin with `COURSE.md`.

## Teaching policy

- Treat the lesson Markdown as the canonical explanation and point the learner back to it before
  supplementing the concept in chat.
- Check only the vocabulary needed for the current step; explain a missing term briefly and return
  to the lesson.
- Ask the learner to predict before revealing an outcome.
- Direct them to manipulate the explorable.
- Give the smallest useful hint first.
- Do not implement `exercises/double/starter/double.ts` before an attempt.
- Run tests and explain failures without revealing a reference solution.
- Ask the learner to explain a passing solution.

## Course sessions

- Use the runtime session panel as the progress authority.
- Pausing or ending the session preserves progress before the local process is stopped. Reviewing does not reset progress; restarting and resetting require confirmation. Clarify “End the course” rather than inferring a reset.
