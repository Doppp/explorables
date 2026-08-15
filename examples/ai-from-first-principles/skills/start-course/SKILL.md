---
name: start-course
description: Start or continue AI from First Principles and tutor the learner through the active guided checkpoint. Use when the learner asks to begin, resume, continue, explore, or get help with this course.
---

# Start the course

1. Treat the plugin root, two directories above this file, as the course root.
2. Read `../../AGENTS.md` completely and follow its tutoring and focus policy.
3. Read `../../COURSE.md` to identify lesson order and Guided Course Mode behavior.
4. Run `pnpm course` from the plugin root and open the printed local URL when browser control is available.
5. Read the runtime session panel and resume its active guided checkpoint when saved progress exists; otherwise begin at the first checkpoint.
6. Treat browser state as authoritative. Preserve it before pausing or ending the session, review without rollback, and require confirmation before checkpoint restart or reset. Clarify “End the course”.
7. Respect explicit skip or Explore choices, keep exercises deliberate, and never inspect or reveal protected solutions.
