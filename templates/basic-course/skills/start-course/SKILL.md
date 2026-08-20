---
name: start-course
description: Start or continue this explorables course and tutor the learner through its active lesson. Use when the learner asks to begin, resume, continue, or get help with this course.
---

# Start the course

1. Treat the plugin root, two directories above this file, as the course root.
2. Read `../../AGENTS.md` completely and follow its tutoring policy.
3. Read `../../COURSE.md` to identify lesson order and current course behavior.
4. Run `pnpm course` from the plugin root and open the printed local URL when browser control is available.
5. Read the runtime's `data-explorables-*` and `data-tutor-*` state, resume its saved checkpoint when progress exists, and initiate that checkpoint in conversation.
6. Teach in chat, then send the learner to the browser to predict, manipulate, and inspect evidence. Use the collapsed lesson notes as the durable reference.
7. Preserve browser progress before pausing or ending the session. Review without rollback and require confirmation before restarting or resetting. Clarify “End the course”.
8. Keep exercise execution deliberate and never reveal protected solutions.
