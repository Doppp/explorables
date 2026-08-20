---
name: start-course
description: Start or continue AI from First Principles and tutor the learner through the active guided checkpoint. Use when the learner asks to begin, resume, continue, explore, or get help with this course.
---

# Start the course

1. Treat the plugin root, two directories above this file, as the course root.
2. Read `../../AGENTS.md` completely and follow its tutoring and focus policy.
3. Read `../../COURSE.md` to identify lesson order and Guided Course Mode behavior.
4. Run `pnpm course` from the plugin root and open the printed local URL when browser control is available.
5. Inspect the runtime's `data-explorables-*` and `data-tutor-*` state, resume its active guided checkpoint when saved progress exists, and initiate that checkpoint in conversation.
6. Teach in chat, then send the learner to the browser to predict, manipulate, and inspect evidence. Use the collapsed lesson notes as the durable reference.
7. Treat browser progress as authoritative. Preserve it before pausing or ending the session, review without rollback, and require confirmation before checkpoint restart or reset. Clarify “End the course”.
8. Respect explicit skip or Explore choices, keep exercises deliberate, and never inspect or reveal protected solutions.
