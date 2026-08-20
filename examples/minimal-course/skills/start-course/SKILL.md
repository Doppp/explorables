---
name: start-course
description: Start or continue the minimal explorables course and tutor its doubling lesson. Use when the learner asks to begin, resume, continue, or get help with this course.
---

# Start the course

1. Treat the plugin root, two directories above this file, as the course root.
2. Read `../../AGENTS.md` completely and follow its tutoring policy.
3. Read `../../COURSE.md` to identify lesson order.
4. Run `pnpm course` from the plugin root and open the printed local URL when browser control is available.
5. Run `pnpm tutor` in a second long-running terminal and keep this tutoring turn open while the learner works in the browser. Wait for each `[course-interaction]` event, then respond in conversation with the next relevant prompt and resume waiting without inferring understanding from a click.
6. Read the runtime session panel and resume its saved lesson when progress exists; otherwise begin at the first lesson.
7. Preserve browser progress before pausing or ending the session. Review without rollback and require confirmation before restarting or resetting. Clarify “End the course”.
8. Guide the learner without implementing the central exercise before an attempt or revealing its reference solution. Stop the tutor listener when the session ends.
