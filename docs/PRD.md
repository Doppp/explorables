# explorables: Open Explorable Course Runtime
## Product Requirements, Technical Specification, and Course Authoring Guide

**Status:** Draft v0.1  
**Date:** 21 July 2026  
**Product name:** `explorables`  
**Supported initial hosts:** Codex and Claude Code Desktop  
**Public site:** `https://explorables.ai`  
**Canonical repository:** `git@github.com:Doppp/explorables.git`  
**Default branch:** `master`  
**First course:** *AI from First Principles*  
**Tagline:** *See how it works. Build it yourself.*

> `explorables` is styled in lowercase in product copy, package names, and documentation.

---

# 1. Executive summary

`explorables` is a small, open-source runtime and file format for interactive technical courses that run naturally alongside agentic coding environments. Its initial host integrations target Codex and Claude Code Desktop.

A course is a normal folder containing:

- Plain Markdown lessons
- TypeScript explorable modules
- Optional programming exercises and tests
- Static assets
- An `AGENTS.md` file that tells Codex how to act as the course tutor

A learner clones or downloads the folder, opens it in Codex or Claude Code Desktop, and says:

> Start this course.

The coding agent reads the repository guidance, starts the local course runtime, opens the rendered course in its browser or preview pane, and helps the learner work through the material. The browser provides graphics, simulations, visual explanations, and direct manipulation. The host coding environment provides the conversational tutor, repository, editor, terminal, and test runner.

There is no account, login, hosted learner database, central progress system, certificate system, audio system, or learning-management system in the first version. A small public landing page is built from the same repository and deployed as a static GitHub Pages site at `explorables.ai`.

The architecture is intentionally small:

```text
Course folder
├── Markdown lessons
├── TypeScript explorables
├── Exercises and tests
└── AGENTS.md
        │
        ▼
`explorables` runtime
├── Markdown renderer
├── Explorable sandbox
├── Exercise launcher
└── Local web server
        │
        ▼
Agentic coding desktop
├── Codex or Claude Code tutor and coding workspace
└── Built-in browser or preview-pane course interface

Public web
└── Static landing page at explorables.ai
```

The first reference course, *AI from First Principles*, is inspired by the idea that developers should use LLMs as tools while deliberately acquiring the underlying knowledge themselves. It teaches machine learning, neural networks, language models, transformers, open-weight models, evaluation, adaptation, and practical contribution paths.

---

# 2. Product thesis

Technical learning should happen in the same environment where the learner can:

- Inspect a real implementation
- Change a variable and immediately see what happens
- Write code
- Run tests
- Ask questions
- Debug failures
- Build a complete project

Most online courses separate these activities across videos, notebooks, quizzes, browser IDEs, and local repositories. `explorables` treats them as one continuous experience.

The learner sees and manipulates a concept in the built-in browser, then works with its implementation in the adjacent Codex project.

```text
Understand visually → predict → manipulate → implement → debug → explain
```

`explorables` is not intended to be a general-purpose LMS. It is an open course format for hands-on, explorable technical education.

---

# 3. Core product decisions

## 3.1 The course is the repository

The source repository is the complete distributable course.

It contains all prose, code, assets, exercises, tests, and instructions required to run the course. A course can be forked, reviewed, translated, versioned, and submitted through normal open-source workflows.

## 3.2 Plain Markdown is the authoring format

Course authors write ordinary Markdown with YAML frontmatter and a very small set of optional directives.

`explorables` does not use MDX as the canonical course format. Course prose should remain readable on GitHub and usable without the `explorables` runtime.

## 3.3 TypeScript modules provide interaction

Interactive parts are authored as TypeScript modules that compile to browser JavaScript.

The course Markdown imports them declaratively:

```md
:::explorable{src="../explorables/loss-surface/index.ts" height="520"}
A text alternative describing the explorable.
:::
```

## 3.4 Host-neutral instructions with thin agent adapters

A per-course `SKILL.md` is not required.

`explorables` keeps the canonical teaching policy in `AGENTS.md`. Codex reads that file directly. Claude Code Desktop reads `CLAUDE.md`, so a `explorables` course includes a very small `CLAUDE.md` that imports or mirrors the canonical instructions and adds Claude-specific launch guidance.

The canonical instructions define:

- How to launch the course
- How the coding agent should teach
- Which files contain lesson content
- When the agent may give hints
- Which assignments it must not solve for the learner
- How to run tests

Optional Codex or Claude skills can be added later for explicit commands such as `start-course`, but skills are distribution adapters rather than part of the core course specification.

## 3.5 No backend is required

The first version has:

- No accounts
- No login
- No learner database
- No analytics
- No remote submissions
- No server-side rendering
- No required cloud service

The local filesystem and Git history already contain meaningful evidence of completed programming work.

## 3.6 No audio in the first version

Audio is deliberately excluded to keep the runtime, contribution process, and authoring model focused.

It can later be added as an optional asset type without changing the core course format.

## 3.7 The public landing page lives in the same repository

The repository contains a small static site under `apps/site`.

It introduces the project, explains how courses work, features the first course, links to the authoring guide, and directs visitors to the GitHub repository.

The site:

- Is built with the existing TypeScript, React, and Vite stack
- Requires no backend
- Contains no analytics in v1
- Is deployed through GitHub Actions to GitHub Pages
- Uses the custom domain `explorables.ai`
- Keeps all deployment configuration version controlled
- Remains separate from the local course runtime

GitHub Pages configuration and custom-domain setup must follow current official GitHub documentation. A `CNAME` asset alone is not treated as sufficient configuration; the repository Pages settings or API must also be configured.

## 3.7 Agentic coding environments are hosts, not proprietary dependencies of the format

The best initial experiences are in Codex and Claude Code Desktop because both combine a coding workspace with a browser or preview surface.

However, a `explorables` course is still a normal web project. The same course can later run in:

- A normal browser
- Another coding agent
- A static hosted site
- A classroom environment
- A future ChatGPT app
- Other coding-agent desktops with a local preview surface

The course format must not require private Codex or Claude APIs.

---

# 4. Goals and non-goals

## 4.1 Goals

`explorables` should:

1. Let a technical author create a course by writing Markdown and TypeScript.
2. Let contributors submit courses and improvements through GitHub pull requests.
3. Run a complete course locally with one install command.
4. Render interactive visual explanations in the Codex built-in browser.
5. Let learners move naturally between the browser and real project code.
6. Give Codex enough repository guidance to act as a tutor rather than an answer generator.
7. Keep course packages understandable without the runtime.
8. Support reusable explorable modules and shared component libraries.
9. Validate course structure, links, imports, accessibility, and exercises in CI.
10. Make the first course a credible path from ordinary software development into AI and LLM engineering.
11. Publish a clear static landing page at `explorables.ai` from the same repository.
12. Make repository creation, builds, tests, releases, and site deployment reproducible through normal GitHub workflows.

## 4.2 Non-goals for v1

`explorables` will not initially provide:

- User accounts
- Cross-device progress
- Certificates
- Payments
- Cohort administration
- Instructor dashboards
- Central grading
- Hosted code execution
- Cloud GPUs
- A drag-and-drop course editor
- Arbitrary third-party plugins loaded without review
- Audio generation
- Mobile-first delivery
- Support for every educational subject
- A proprietary course marketplace
- A marketing CMS or dynamic website backend

---

# 5. Intended users

## 5.1 Learner

The initial learner:

- Has basic computer science knowledge
- Can read and modify code
- Has built a small web application or equivalent software project
- Uses coding agents but wants deeper technical ownership
- Is comfortable opening a repository
- Wants to understand systems rather than only use abstractions

## 5.2 Course author

The initial course author:

- Is comfortable with Markdown
- Can write or review TypeScript
- Understands the subject being taught
- Wants to publish through GitHub
- Prefers course-as-code over a visual LMS

## 5.3 Explorable contributor

The explorable contributor:

- Builds reusable visual or interactive components
- May contribute without writing an entire course
- Uses TypeScript, DOM, SVG, Canvas, WebGL, or a supported UI adapter

## 5.4 Exercise contributor

The exercise contributor:

- Creates starter code, fixtures, tests, and reference solutions
- Can improve course depth without touching the visual runtime

---

# 6. Learner experience

## 6.1 Installation

A learner can clone a course repository:

```bash
git clone https://github.com/example/ai-from-first-principles.git
cd ai-from-first-principles
pnpm install --frozen-lockfile
```

They open the folder in Codex or Claude Code Desktop and type:

> Start the course.

Codex reads `AGENTS.md`; Claude Code Desktop reads `CLAUDE.md`. The host runs the documented start command and opens the local course URL in its built-in browser or preview pane.

A direct terminal path also exists:

```bash
pnpm course
pnpm site:dev
```

## 6.2 Screen layout

The intended desktop experience is:

```text
┌───────────────────────────┬────────────────────────────────────┐
│ Codex or Claude Code      │ Browser or preview pane                   │
│                           │                                    │
│ Tutor conversation        │ Course prose                       │
│ Repository files          │ Interactive visualisation          │
│ Code changes              │ Controls and direct manipulation   │
│ Terminal and tests        │ Exercise instructions              │
│                           │                                    │
└───────────────────────────┴────────────────────────────────────┘
```

The browser or preview pane is the primary reading and interaction surface. The coding-agent workspace is the primary tutoring and implementation surface.

## 6.3 Typical lesson flow

A lesson should usually follow this sequence:

1. **Encounter** — show a phenomenon before fully explaining it.
2. **Predict** — ask the learner what they think will happen.
3. **Manipulate** — let the learner alter the system.
4. **Inspect** — reveal internal values, state, or execution.
5. **Explain** — introduce the underlying concept.
6. **Implement** — ask the learner to write a focused piece of code.
7. **Debug** — provide a broken system or failed test.
8. **Transfer** — apply the idea in a different situation.

These stages are pedagogical guidance, not mandatory runtime primitives. Most can be written as ordinary Markdown around one or two interactive embeds.

---

# 7. Public landing page

## 7.1 Purpose

The public site at `explorables.ai` explains the project before a visitor clones a course.

It is not the hosted course player and it does not track learning. It is a lightweight entry point to the open-source project.

## 7.2 Required pages and sections

The v1 site may be a single page with anchored sections:

1. **Hero**
   - Product name: `explorables`
   - A concise explanation of the idea
   - Primary action: view the first course
   - Secondary action: view the GitHub repository

2. **How it works**
   - Read and manipulate lessons in the browser or preview pane
   - Work on real exercises in the coding-agent workspace
   - Use the agent as a tutor rather than a substitute

3. **First course**
   - *AI from First Principles*
   - Intended audience
   - Main topics
   - Link to its repository directory or release

4. **Create a course**
   - Markdown lessons
   - TypeScript explorables
   - Exercises and tests
   - Link to `docs/course-authoring.md`

5. **Open source**
   - Licence
   - Contribution link
   - Repository link

6. **Footer**
   - GitHub
   - Documentation
   - Licence
   - No tracking statement

## 7.3 Design requirements

The landing page should be:

- Simple and technical
- Fast to load
- Responsive
- Keyboard accessible
- Usable in light and dark mode
- Free of stock photography
- Free of unnecessary animation
- Free of cookie banners because v1 uses no analytics or tracking
- Visually consistent with the local course runtime

## 7.4 Implementation

Recommended location:

```text
apps/
└── site/
    ├── index.html
    ├── src/
    ├── public/
    │   └── CNAME
    └── vite.config.ts
```

The `CNAME` file contains:

```text
explorables.ai
```

The site uses React and Vite already present in the monorepo. It should not introduce another frontend framework solely for the landing page.

## 7.5 GitHub Pages deployment

A workflow under `.github/workflows/pages.yml` should:

1. Run on pushes to `master`.
2. Install the pinned Node and pnpm versions.
3. Install dependencies from the lockfile.
4. Run relevant validation and tests.
5. Build `apps/site`.
6. Upload the static artifact.
7. Deploy it with GitHub Pages.

The workflow must use GitHub's current official Pages actions and least-privilege permissions.

The repository must be configured to publish through GitHub Actions. The custom domain should be configured in GitHub Pages settings or through the GitHub API. DNS changes outside GitHub should be documented when the agent cannot perform them.

## 7.6 Landing-page acceptance criteria

- `pnpm site:dev` starts the site locally.
- `pnpm site:build` creates a static artifact.
- The artifact contains the custom-domain file.
- Links to documentation and the repository work.
- The site passes automated accessibility checks.
- The site deploys from `master` through GitHub Actions.
- `https://explorables.ai` is the intended production URL.
- No application backend or tracking service is required.

# 8. Course package specification

## 8.1 Required files

A minimal course contains:

```text
my-course/
├── README.md
├── AGENTS.md
├── CLAUDE.md
├── COURSE.md
├── package.json
├── pnpm-lock.yaml
└── lessons/
    └── 01-introduction.md
```

## 8.2 Recommended full structure

```text
my-course/
├── README.md
├── AGENTS.md
├── CLAUDE.md
├── COURSE.md
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── explorables.config.ts
│
├── .claude/
│   ├── launch.json
│   └── skills/
│       └── start-course/
│           └── SKILL.md
│
├── lessons/
│   ├── 01-introduction.md
│   ├── 02-core-concept.md
│   └── 03-project.md
│
├── explorables/
│   ├── loss-surface/
│   │   ├── index.ts
│   │   ├── styles.css
│   │   ├── index.test.ts
│   │   └── README.md
│   └── attention-map/
│       └── index.ts
│
├── exercises/
│   ├── gradient-descent/
│   │   ├── README.md
│   │   ├── starter/
│   │   ├── tests/
│   │   └── solution/
│   └── attention/
│       └── ...
│
├── assets/
│   ├── images/
│   └── data/
│
├── shared/
│   ├── components/
│   └── utilities/
│
└── .github/
    └── workflows/
        └── validate-course.yml
```

## 8.3 `README.md`

`README.md` is for humans browsing the repository.

It should include:

- Course description
- Intended audience
- Prerequisites
- Installation
- How to start
- Course licence
- Contribution instructions
- Estimated time commitment

## 8.4 `AGENTS.md`

`AGENTS.md` is for Codex and other compatible coding agents.

It should remain concise and operational. It should not contain the entire course.

Example:

```md
# Course repository instructions

This repository contains an interactive course.

## Start the course

1. Run `pnpm install` if dependencies are missing.
2. Run `pnpm course`.
3. Open the printed local URL in the built-in browser.
4. Read `COURSE.md` to understand the course order.

## Tutoring behaviour

- Teach through questions, prediction, inspection, and debugging.
- Do not complete the central exercise implementation for the learner.
- Give the smallest useful hint first.
- Refer to the current lesson and rendered explorable.
- Run tests when the learner asks or after they make an attempt.
- Ask the learner to explain a working solution before moving on.
- Do not modify files under `exercises/**/solution/`.
- Do not reveal hidden or reference solutions.

## Course navigation

- Lessons are ordered in `COURSE.md`.
- When the learner says “continue”, identify the current lesson from
  the open browser page and working files.
- When a lesson references an exercise, read that exercise’s README.
```

## 8.5 `CLAUDE.md`

`CLAUDE.md` is the thin Claude Code Desktop adapter.

It should import or restate the canonical repository teaching policy from `AGENTS.md` and add only Claude-specific operational guidance.

Example:

```md
@AGENTS.md

# Claude Code Desktop

- Use the Browser or Preview pane for lessons and explorables.
- Use the file and terminal panes for programming exercises.
- Start the local course using `.claude/launch.json` when available.
- Keep the course preview beside the conversation where practical.
```

If the host does not support importing another instruction file, the generated course template may duplicate the short canonical policy with a generated warning that `AGENTS.md` remains the source of truth.

### `.claude/launch.json`

Official courses should include a Claude preview configuration:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "explorables-course",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["course"],
      "port": 4173,
      "autoPort": true
    }
  ]
}
```

The exact schema must be verified against the current Claude Code Desktop documentation during implementation.

### Optional Claude skill

A course may include:

```text
.claude/
└── skills/
    └── start-course/
        └── SKILL.md
```

This provides an explicit `/start-course` command but is not required by the `explorables` format.

## 8.6 `COURSE.md`

`COURSE.md` is the course entry point.

It uses YAML frontmatter followed by normal Markdown.

Example:

```md
---
id: ai-from-first-principles
title: AI from First Principles
version: 0.1.0
summary: Learn modern AI by seeing, implementing, and debugging its machinery.
audience:
  - software developers
  - computer science graduates
estimatedHours: 100
license: CC-BY-4.0
---

# AI from First Principles

This course develops practical understanding of machine learning,
language models, and open-weight model systems.

## Outcomes

By the end of the course, you should be able to:

- implement core machine-learning operations
- explain and implement backpropagation
- build a tokenizer and small language model
- implement self-attention and a decoder-only transformer
- evaluate and adapt an open-weight model
- choose a credible route into AI engineering or open-source contribution

## Lessons

1. [How machines learn](lessons/01-how-machines-learn.md)
2. [Gradient descent](lessons/02-gradient-descent.md)
3. [Backpropagation](lessons/03-backpropagation.md)
4. [Tokenisation](lessons/04-tokenisation.md)
5. [Self-attention](lessons/05-self-attention.md)
6. [Open-weight models](lessons/06-open-weight-models.md)
7. [Evaluation](lessons/07-evaluation.md)
8. [What next](lessons/08-what-next.md)
```

### Required frontmatter

| Field | Type | Purpose |
|---|---|---|
| `id` | string | Stable machine-readable course identifier |
| `title` | string | Display name |
| `version` | semver string | Course package version |
| `summary` | string | Short description |
| `license` | SPDX or content licence string | Reuse terms |

### Recommended frontmatter

| Field | Type |
|---|---|
| `audience` | string array |
| `prerequisites` | string array |
| `estimatedHours` | number |
| `authors` | object array |
| `repository` | URL |
| `language` | BCP-47 string |
| `tags` | string array |

---

# 9. Lesson Markdown specification

## 9.1 Design principle

A lesson must be useful as plain Markdown.

The runtime adds interactivity, but the source should still communicate:

- What is being taught
- What the learner should do
- What the fallback explanation is
- Which exercise is associated with the lesson

## 9.2 Lesson frontmatter

```md
---
id: gradient-descent
title: Gradient Descent
order: 2
objectives:
  - explain what a gradient represents
  - predict the effect of changing a learning rate
  - implement a gradient update
prerequisites:
  - derivatives
  - loss-functions
---
```

Only `id` and `title` are required.

## 9.3 Minimal custom syntax

`explorables` v1 should support only two course-specific block directives:

1. `explorable`
2. `exercise`

Everything else is ordinary Markdown.

### Explorable directive

```md
:::explorable{src="../explorables/loss-surface/index.ts" height="520"}
Use the controls to change the learning rate and observe the optimiser.
A text-only alternative should appear here.
:::
```

Supported attributes:

| Attribute | Required | Description |
|---|---:|---|
| `src` | Yes | Relative path to the TypeScript module |
| `height` | No | Suggested rendered height |
| `title` | No | Accessible title |
| `config` | No | Relative JSON configuration file |
| `id` | No | Stable instance identifier |

### Exercise directive

```md
:::exercise{path="../exercises/gradient-descent"}
Implement one update step and run the supplied tests.
:::
```

Supported attributes:

| Attribute | Required | Description |
|---|---:|---|
| `path` | Yes | Relative path to the exercise |
| `command` | No | Override test command |
| `title` | No | Display title |

## 9.4 Why the directive set is intentionally small

Prediction prompts, explanations, reflections, warnings, and checkpoints do not require custom runtime types. Authors can express them with headings, block quotes, lists, and normal prose.

New directives should be introduced only when the runtime must perform behaviour that cannot be represented through Markdown or an explorable module.

---

# 10. Explorable module specification

## 10.1 Authoring language

Explorables are authored in TypeScript 7.0 and compiled into browser JavaScript.

The runtime shell may use React, but the course module contract is framework-neutral. An author can use:

- Vanilla DOM
- SVG
- Canvas
- D3
- Three.js
- A React adapter
- Another reviewed browser library

## 10.2 Core interface

```ts
export type ExplorableValue =
  | null
  | boolean
  | number
  | string
  | ExplorableValue[]
  | { [key: string]: ExplorableValue };

export interface ExplorableContext {
  instanceId: string;
  lessonId: string;
  config: ExplorableValue;
  emit(event: ExplorableEvent): void;
}

export interface ExplorableEvent {
  type: string;
  payload?: ExplorableValue;
}

export interface ExplorableHandle {
  destroy?(): void;
  resize?(width: number, height: number): void;
}

export interface ExplorableModule {
  mount(
    root: HTMLElement,
    context: ExplorableContext,
  ): ExplorableHandle | Promise<ExplorableHandle>;
}
```

An explorable exports a default object:

```ts
import type { ExplorableModule } from "@explorables/explorable";

const module: ExplorableModule = {
  mount(root, context) {
    // Render and attach event listeners.

    return {
      destroy() {
        root.replaceChildren();
      },
    };
  },
};

export default module;
```

## 10.3 Minimal example

```ts
import type { ExplorableModule } from "@explorables/explorable";

const explorable: ExplorableModule = {
  mount(root, context) {
    const wrapper = document.createElement("section");
    const label = document.createElement("label");
    const slider = document.createElement("input");
    const output = document.createElement("output");

    label.textContent = "Learning rate";
    slider.type = "range";
    slider.min = "0.01";
    slider.max = "2";
    slider.step = "0.01";
    slider.value = "0.1";

    const render = () => {
      const value = Number(slider.value);
      output.value = value.toFixed(2);

      context.emit({
        type: "learning-rate-changed",
        payload: { value },
      });
    };

    slider.addEventListener("input", render);
    label.append(slider, output);
    wrapper.append(label);
    root.append(wrapper);
    render();

    return {
      destroy() {
        slider.removeEventListener("input", render);
        root.replaceChildren();
      },
    };
  },
};

export default explorable;
```

## 10.4 Events

Events are local and ephemeral in v1.

They allow:

- The runtime to update visible state
- One explorable to communicate with its wrapper
- Codex to inspect browser state when useful
- Tests to assert expected behaviour

They are not sent to a remote analytics service.

Recommended event conventions:

```text
prediction-submitted
parameter-changed
simulation-started
simulation-completed
exercise-opened
state-reset
```

## 10.5 Accessibility requirements

Every explorable must:

- Be operable by keyboard
- Use native controls where practical
- Have a visible title or accessible label
- Provide a text alternative in the Markdown directive body
- Avoid using colour as the only meaning
- Respect reduced-motion preferences
- Expose important dynamic output through `aria-live`
- Resize down to a narrow desktop panel
- Avoid trapping focus

## 10.6 Testing requirements

Each explorable should include:

- Unit tests for the underlying model or calculation
- A mount/unmount smoke test
- At least one interaction test
- An accessibility check
- A browser screenshot or visual regression test for first-party courses

---

# 11. Sandboxing and security

Open-source courses can contain executable browser code. `explorables` must treat course code as untrusted by default.

## 11.1 Sandboxed iframe

Each explorable is bundled into a self-contained browser artifact and loaded inside a sandboxed iframe.

Recommended iframe permissions:

```html
<iframe sandbox="allow-scripts"></iframe>
```

Do not grant `allow-same-origin` by default.

## 11.2 Content Security Policy

The explorable iframe should use a restrictive CSP resembling:

```text
default-src 'none';
script-src 'unsafe-inline' blob:;
style-src 'unsafe-inline';
img-src data: blob:;
font-src data:;
connect-src 'none';
media-src 'none';
frame-src 'none';
```

Network access must be opt-in and unavailable for courses accepted into the official catalogue unless explicitly reviewed.

## 11.3 Build-time bundling

The runtime owns the build configuration. Courses may not provide arbitrary Vite configuration files that execute during startup.

Explorable dependencies are bundled before loading into the iframe. Runtime imports from arbitrary external CDNs are not allowed in official courses.

## 11.4 Dependency security

The reference implementation uses pnpm 11 with a committed lockfile.

Course dependencies must:

- Be pinned through the lockfile
- Avoid unreviewed lifecycle scripts
- Use an explicit build-script allowlist
- Pass dependency audit checks in CI
- Be reviewed when introduced to an official course

## 11.5 Exercise execution

Exercises are never automatically executed merely because a lesson is opened.

Codex or the learner must deliberately run the documented command. Exercises that execute untrusted code should use an appropriate container or local sandbox.

## 11.6 Trust levels

`explorables` should distinguish:

1. **First-party course** — maintained by the core project.
2. **Reviewed community course** — accepted into the official catalogue after review.
3. **External compatible course** — runnable from another repository with a warning.
4. **Local private course** — authored and run locally.

---

# 12. Exercise package specification

## 12.1 Structure

```text
exercises/
└── gradient-descent/
    ├── README.md
    ├── exercise.json
    ├── starter/
    │   └── gradient.ts
    ├── tests/
    │   └── gradient.test.ts
    └── solution/
        └── gradient.ts
```

`solution/` may be omitted from public learner distributions or encrypted/kept in an instructor branch.

## 12.2 `exercise.json`

```json
{
  "id": "gradient-descent-step",
  "title": "Implement one gradient descent step",
  "language": "typescript",
  "starter": "starter",
  "testCommand": "pnpm vitest run tests/gradient.test.ts",
  "estimatedMinutes": 30,
  "centralFiles": ["starter/gradient.ts"],
  "protectedPaths": ["solution"]
}
```

## 12.3 Exercise design principles

A good exercise should:

- Test one or two central ideas
- Have a clear stopping condition
- Provide deterministic tests where possible
- Include edge cases
- Avoid large amounts of unrelated boilerplate
- Make the learner inspect failures
- Require a short explanation after tests pass

## 12.4 Codex behaviour

The course `AGENTS.md` should prohibit Codex from filling in the central implementation before the learner attempts it.

Codex may:

- Explain an error
- Point to a relevant function
- Run tests
- Suggest a smaller analogous example
- Provide progressively stronger hints
- Review the learner’s implementation

Codex should not:

- Copy the reference solution
- Replace the learner’s implementation wholesale
- silently complete a central assignment
- claim understanding merely because tests pass

---

# 13. Runtime architecture

## 13.1 Runtime responsibilities

The `explorables` runtime performs only the following:

1. Locate and parse `COURSE.md`.
2. Parse lesson Markdown and frontmatter.
3. Render standard Markdown.
4. Resolve `explorable` and `exercise` directives.
5. Bundle explorable TypeScript modules.
6. Load each explorable in a sandboxed iframe.
7. Render course navigation.
8. Serve static assets.
9. Validate the course package.
10. Provide development errors with file and line references.

It does not teach the subject itself. The course content and Codex instructions do that.

## 13.2 Runtime component diagram

```text
                         Course repository
                    ┌────────────────────────┐
                    │ COURSE.md              │
                    │ lessons/*.md           │
                    │ explorables/*.ts       │
                    │ exercises/*            │
                    │ assets/*               │
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │ `explorables` compiler         │
                    │                        │
                    │ Markdown pipeline      │
                    │ Frontmatter validation │
                    │ Directive resolver     │
                    │ Explorable bundler     │
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │ Local course server    │
                    │                        │
                    │ React course shell     │
                    │ Lesson navigation      │
                    │ Sandboxed iframes      │
                    │ Exercise links         │
                    └────────────┬───────────┘
                                 │
                                 ▼
                    Codex or Claude Code Desktop browser/preview
```

## 13.3 No database

The runtime holds only transient UI state.

A later optional local resume file may be introduced:

```text
.explorables/local-state.json
```

It must be:

- Disabled by default
- Local only
- Listed in `.gitignore`
- Non-essential to course completion

---

# 14. Technology stack

## 14.1 Baseline

| Area | Choice |
|---|---|
| Language | TypeScript 7.0 |
| Runtime | Node.js 24 LTS |
| Package manager | pnpm 11 |
| Monorepo | pnpm workspaces |
| Dev server and bundling | Vite |
| Runtime UI shell | React |
| Markdown | unified, remark, rehype |
| Directives | remark-directive |
| Frontmatter | gray-matter or remark-frontmatter |
| Schema validation | Zod |
| Code highlighting | Shiki |
| Formatting and linting | Biome |
| Unit tests | Vitest |
| Browser tests | Playwright |
| Accessibility tests | axe-core |
| Optional visualisation | D3, SVG, Canvas |
| CI | GitHub Actions |
| Release | npm packages and GitHub releases |

## 14.2 Why plain Markdown rather than MDX

TypeScript 7 is a native compiler and language service. At release, some ecosystems requiring TypeScript language-service plugins, including MDX and Astro, still needed to remain on TypeScript 6 for parts of their editor integration.

Plain Markdown avoids making the course format dependent on those plugin paths. The runtime parses Markdown itself and loads TypeScript explorables through an explicit directive.

This also improves:

- GitHub readability
- Portability
- Security review
- Diff quality
- Separation between prose and executable code

## 14.3 TypeScript 7 policy

The repository should pin TypeScript 7 in the root `package.json` and lockfile.

```json
{
  "devDependencies": {
    "typescript": "^7.0.0"
  }
}
```

Use:

```bash
pnpm tsc --noEmit
```

for type checking.

The project should not depend on custom TypeScript language-service plugins in v1.

## 14.4 Node.js policy

Use Node.js 24 LTS for production and CI.

A `.node-version` file should pin the supported major version:

```text
24
```

## 14.5 Package manager policy

Use pnpm 11 because it provides:

- Strong workspace support
- Reproducible lockfiles
- Efficient shared storage
- Safer dependency installation defaults
- Explicit control over dependency build scripts

---

# 15. Core repository architecture

```text
explorables/
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── LICENSE
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── tsconfig.base.json
├── biome.json
│
├── packages/
│   ├── cli/
│   │   └── src/
│   ├── course-schema/
│   │   └── src/
│   ├── markdown/
│   │   └── src/
│   ├── runtime/
│   │   └── src/
│   ├── explorable-sdk/
│   │   └── src/
│   ├── sandbox/
│   │   └── src/
│   ├── validator/
│   │   └── src/
│   └── create-course/
│       └── src/
│
├── apps/
│   ├── site/
│   ├── dev-preview/
│   └── component-gallery/
│
├── templates/
│   └── basic-course/
│
├── examples/
│   ├── minimal-course/
│   └── ai-from-first-principles/
│
└── .github/
    └── workflows/
```

## 15.1 Package responsibilities

### `apps/site`

- Public landing page for `explorables.ai`
- Static Vite build
- Links to the course, authoring guide, and repository
- GitHub Pages custom-domain asset
- No runtime dependency on the course server

### `@explorables/cli`

Commands:

```bash
explorables start [path]
explorables validate [path]
explorables test [path]
explorables build [path]
explorables new <name>
```

### `@explorables/course-schema`

Zod schemas and TypeScript types for:

- Course frontmatter
- Lesson frontmatter
- Directive attributes
- Exercise manifests
- Runtime configuration

### `@explorables/markdown`

- Markdown parsing
- Frontmatter extraction
- Directive transformation
- Link resolution
- Sanitisation

### `@explorables/runtime`

- Course shell
- Lesson navigation
- Error UI
- Exercise launcher
- Browser rendering

### `@explorables/explorable`

- Explorable interfaces
- Event protocol
- Test utilities
- Optional adapters

### `@explorables/sandbox`

- Bundling
- Iframe creation
- CSP
- `postMessage` bridge
- Error isolation

### `@explorables/validator`

- Structural validation
- Broken links
- Missing files
- Duplicate IDs
- Import validation
- Accessibility linting
- Exercise command validation

### `create-explorables-course`

Scaffolds a new course from the reference template.

---

# 16. Coding-agent host integration

## 16.1 Canonical course instructions

Every course submitted to the official catalogue must include `AGENTS.md`.

It is the canonical host-neutral teaching and operational policy for the repository.

It defines:

- Start commands
- Tutoring behaviour
- Course routing
- Protected solution paths
- Test instructions

## 16.2 Codex adapter

Codex uses `AGENTS.md` directly.

When asked to start the course, Codex should:

1. Read `COURSE.md`.
2. Verify dependencies.
3. Run `pnpm course`.
4. Open the local URL in the built-in browser.
5. Introduce the first lesson.
6. Ask the learner to interact with the page rather than summarising the entire course.
7. Move into exercise files only when referenced by the current lesson.

An optional Codex skill may be added later for an explicit `start-course` workflow, but it is not required.

## 16.3 Claude Code Desktop adapter

Claude Code Desktop uses:

```text
CLAUDE.md
.claude/launch.json
```

`CLAUDE.md` should reference the canonical policy in `AGENTS.md` and add only Claude-specific instructions.

When asked to start the course, Claude Code Desktop should:

1. Read `CLAUDE.md` and `COURSE.md`.
2. Start the preview using `.claude/launch.json` or `pnpm course`.
3. Open the local course in the Browser or Preview pane.
4. Keep the preview beside the conversation where practical.
5. Use file and terminal panes for exercises.
6. Apply the same tutoring restrictions as Codex.

An optional `.claude/skills/start-course/SKILL.md` may provide an explicit slash command.

## 16.4 Host-neutral continuation

When the learner says “continue”, the host should infer the current location from:

- The page open in the browser or preview pane
- The last discussed lesson
- Modified exercise files
- The course order in `COURSE.md`

No remote progress record is needed.

## 16.5 Adapter principle

Host-specific files must remain thin wrappers.

The following remain host-neutral:

```text
COURSE.md
lessons/
explorables/
exercises/
assets/
```

`explorables` must not depend on:

- Private Codex browser APIs
- Private Claude browser APIs
- ChatGPT Apps SDK
- Claude-specific DOM bridges
- Provider-managed learner state
- A particular model vendor

The host needs only to:

1. Start a local command.
2. Open localhost.
3. Read repository files.
4. Run exercise commands.
5. Discuss the learner's work.


# 17. Open-source distribution model

## 17.7 Canonical GitHub repository

The canonical repository is:

```text
git@github.com:Doppp/explorables.git
```

It is a public open-source repository and uses `master` as its default branch.

Repository automation and documentation must assume:

```text
owner: Doppp
repository: explorables
default branch: master
remote: git@github.com:Doppp/explorables.git
```

Do not use `main` in workflows, examples, or branch filters unless documenting compatibility with forks.

The implementation agent is authorised to create the repository when:

- GitHub CLI is installed
- The active GitHub account has permission to create repositories under `Doppp`
- `gh auth status` succeeds
- A repository with that name does not already exist

It must never force-push or overwrite unrelated history. If the repository already exists, it must inspect and preserve its history.



## 17.1 Three levels of distribution

### A. First-party courses

Maintained in the main organisation and held to the full review standard.

### B. Community catalogue courses

Hosted in independent repositories and listed in a static official catalogue after review.

### C. Any compatible repository

Users can run any repository conforming to the format:

```bash
pnpm dlx @explorables/cli start ./path-to-course
```

or:

```bash
pnpm dlx @explorables/cli start https://github.com/author/course
```

Remote repository support should download into an explicit temporary directory and display a trust warning before dependency installation.

## 17.2 Static catalogue

A catalogue can be a normal Git repository:

```text
explorables-catalogue/
├── catalogue.json
├── README.md
└── courses/
    ├── ai-from-first-principles.json
    └── coding-agents.json
```

No catalogue backend is required.

Example entry:

```json
{
  "id": "ai-from-first-principles",
  "title": "AI from First Principles",
  "repository": "https://github.com/explorables-courses/ai-from-first-principles",
  "version": "1.0.0",
  "authors": ["explorables contributors"],
  "license": "CC-BY-4.0",
  "reviewed": true
}
```

## 17.3 Submission paths

Contributors can submit:

- A complete course
- A new lesson
- An explorable
- An exercise
- A translation
- A correction
- Accessibility improvements
- Tests
- Documentation

## 17.4 Pull-request checks

CI should verify:

- Course schema validity
- Lesson IDs are unique
- All lesson links resolve
- All explorable imports build
- No forbidden network access
- Tests pass
- Starter exercises fail the intended tests
- Reference solutions pass
- Accessibility checks pass
- Licence metadata exists
- No solution files are exposed unintentionally

## 17.5 Course ownership

A course can remain in the author’s repository.

Being listed in the catalogue should not require transferring ownership to the core project. The catalogue points to a tagged, immutable release.

## 17.6 Licensing

Recommended defaults:

| Material | Suggested licence |
|---|---|
| Runtime code | Apache-2.0 |
| Explorable code | Apache-2.0 |
| Course prose | CC-BY-4.0 |
| Exercise starter code | Apache-2.0 |
| Reference solutions | Author’s choice; may remain private |
| Third-party assets | Original licence, documented |

---

# 18. Course authoring guide

## 18.1 Create a course

Run:

```bash
pnpm dlx create-explorables-course my-course
cd my-course
pnpm install
pnpm course
```

The template creates:

```text
my-course/
├── README.md
├── AGENTS.md
├── CLAUDE.md
├── COURSE.md
├── package.json
├── explorables.config.ts
├── .claude/
│   └── launch.json
├── lessons/
│   └── 01-introduction.md
├── explorables/
│   └── hello-explorable/
│       └── index.ts
└── exercises/
```

## 18.2 Define the promise before writing lessons

A course author should first answer:

1. Who is this for?
2. What must the learner already know?
3. What can the learner build or explain by the end?
4. Which outcomes require interactive representations?
5. Which outcomes require programming exercises?
6. What does not belong in the course?

Add these answers to `COURSE.md`.

## 18.3 Write the course sequence

Keep the ordered lesson list in `COURSE.md`.

A lesson may link to later optional material, but the main route should be obvious.

Avoid creating a complex prerequisite graph in v1. Authors can express prerequisites in frontmatter and prose.

## 18.4 Write a lesson

Create:

```text
lessons/02-gradient-descent.md
```

Example:

```md
---
id: gradient-descent
title: Gradient Descent
objectives:
  - predict how step size affects optimisation
  - implement a parameter update
---

# Gradient Descent

A model learns by changing its parameters to reduce a measured error.

Before using the controls, predict what will happen when the learning
rate becomes ten times larger.

:::explorable{src="../explorables/loss-surface/index.ts" height="520" title="Gradient descent explorer"}
Change the learning rate and take repeated optimisation steps. A very
large learning rate may cross the minimum repeatedly instead of settling.
:::

## What changed?

Explain why a larger step can make convergence less reliable.

:::exercise{path="../exercises/gradient-descent"}
Implement one parameter update and run the supplied tests.
:::

## Transfer

How would the update change if the model had two parameters instead of one?
```

## 18.5 Build an explorable

Create a directory:

```text
explorables/loss-surface/
├── index.ts
├── model.ts
├── index.test.ts
└── README.md
```

Separate the mathematical or simulation model from rendering where possible.

```ts
// model.ts
export function loss(x: number): number {
  return x * x;
}

export function gradient(x: number): number {
  return 2 * x;
}

export function step(
  parameter: number,
  learningRate: number,
): number {
  return parameter - learningRate * gradient(parameter);
}
```

Then render it in `index.ts`.

The calculation can be tested without a browser.

## 18.6 Use a shared component

Reusable components belong in the runtime component gallery or a shared package.

A course can import:

```ts
import { Slider, OutputPanel } from "@explorables/components";
```

The official component library should remain small and accessible.

Suggested first components:

- Parameter slider
- XY coordinate plot
- Matrix viewer
- Vector viewer
- Execution stepper
- State inspector
- Token strip
- Heat map
- Before-and-after comparison
- Code trace viewer

## 18.7 Add an exercise

Run:

```bash
explorables new exercise gradient-descent
```

Write:

- `README.md` for the learner
- Starter code
- Public tests
- Optional hidden or reference tests
- A reference solution kept out of the learner branch if appropriate

The lesson references the directory, not individual files.

## 18.8 Configure coding-agent tutoring

Edit the canonical `AGENTS.md`, then keep `CLAUDE.md` as a thin adapter.

Specify:

- The launch command
- Teaching style
- What Codex may and may not do
- Protected solution paths
- How to run tests
- Subject-specific expectations

Do not put lesson explanations in either instruction file. The coding agent should read the lesson currently being taught.

## 18.9 Preview

Run:

```bash
pnpm course
```

Open the local URL in the Codex built-in browser.

Review:

- Markdown rendering
- Layout at narrow widths
- Keyboard navigation
- Explorable behaviour
- Error messages
- Exercise links
- Text alternatives

## 18.10 Validate

Run:

```bash
pnpm course:validate
```

Validation should report actionable errors:

```text
lessons/04-attention.md:27
Explorable source does not exist:
../explorables/attention-map/index.ts
```

## 18.11 Test

Run:

```bash
pnpm test
pnpm test:browser
```

For a course submission, CI must pass from a fresh checkout.

## 18.12 Publish

Tag a release:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Optionally submit the tagged release to the catalogue repository through a pull request.

---

# 19. Course quality guidelines

## 19.1 Show before explaining

Whenever possible, let the learner encounter a surprising behaviour before presenting the formal definition.

## 19.2 Require predictions

The learner should commit to an expectation before running important simulations.

This can be ordinary prose:

> Before clicking **Run**, write down whether you expect the value to rise or fall.

It does not require a tracking system.

## 19.3 Link representations

Strong explorables connect several views:

- Formula
- Diagram
- Intermediate values
- Code
- Output

Changing one should update the others.

## 19.4 Keep coding tasks focused

A learner should spend time on the concept, not on unrelated setup.

## 19.5 Include failure

Every substantial concept should include at least one broken case:

- Excessive learning rate
- Data leakage
- Incorrect tensor axis
- Missing causal mask
- Invalid tool termination
- Quantisation error

## 19.6 Ask for explanation

After a working implementation, Codex should ask the learner to explain:

- What the code does
- Why it works
- Where it can fail
- How it was verified

## 19.7 Avoid synthetic difficulty

Do not create difficulty through:

- Unclear instructions
- Hidden dependencies
- Large boilerplate
- Fragile setup
- Needlessly clever tests
- Arbitrary time limits

---

# 20. First reference course: AI from First Principles

## 20.1 Course purpose

*AI from First Principles* is for software developers and computer science graduates who use modern coding agents but want to develop their own underlying competence.

It is motivated by three principles:

1. Use LLMs as tools rather than substitutes for understanding.
2. Learn enough of the machinery to inspect, debug, and extend it.
3. Build toward meaningful participation in the open-weight ecosystem.

## 20.2 Audience

Learners should know:

- Basic programming
- Functions and data structures
- Basic algebra
- How to use a terminal
- How to read a test failure
- Basic Git

Python can be introduced where necessary for model work, even though the `explorables` runtime itself is TypeScript.

## 20.3 Course outcomes

By completion, a learner should be able to:

- Explain the relationship between data, parameters, objectives, and optimisation
- Implement foundational machine-learning algorithms
- Understand and implement automatic differentiation
- Explain tokenisation and next-token prediction
- Implement scaled dot-product attention
- Build and train a small decoder-only transformer
- Inspect and run an open-weight model
- Explain memory, quantisation, KV caching, and inference trade-offs
- Construct a valid evaluation
- Fine-tune a small model with LoRA
- Build a bounded tool-using agent
- Make a credible first open-source contribution

## 20.4 Proposed modules

### Module 0 — Learning with LLMs without outsourcing understanding

Topics:

- What it means to use an LLM as a tool
- Verification
- Reading generated code
- Debugging without agent transcripts
- Declaring AI assistance
- The learner ownership test

Exercise:

- Ask Codex to generate a small program, then trace, modify, break, and repair it.

### Module 1 — Models, data, and evaluation

Topics:

- Rules versus learned systems
- Features, labels, parameters, and loss
- Training, validation, and test sets
- Baselines
- Leakage

Explorables:

- Convert a rule-based classifier into a learned boundary
- Introduce and remove test leakage
- Compare a demo with an evaluation

### Module 2 — Mathematical intuition for learning

Topics:

- Vectors
- Matrix multiplication
- Derivatives
- Gradients
- Probability
- Optimisation

Explorables:

- Vector transformation
- Loss surface
- Gradient stepper
- Learning-rate instability

Exercises:

- Dot product
- Matrix multiplication
- Finite-difference gradient
- Gradient descent

### Module 3 — Classical machine learning

Topics:

- Linear regression
- Logistic regression
- Regularisation
- Trees and ensembles
- Clustering
- PCA
- Bias and variance

Explorables:

- Fit a line manually
- Move a classification threshold
- Overfit a polynomial
- Build a decision tree
- Move cluster centres

Project:

- Implement a small ML library and compare it with reference implementations.

### Module 4 — Neural networks and automatic differentiation

Topics:

- Neurons
- Activations
- Computational graphs
- Backpropagation
- Optimisers
- Initialisation
- Normalisation

Explorables:

- Computation graph builder
- Forward and backward value trace
- Dead ReLU
- Exploding gradient

Project:

- Build a miniature autodiff engine and use it to train a small neural network.

### Module 5 — Text, tokenisation, and language modelling

Topics:

- Unicode and bytes
- Character, word, and byte tokenisation
- BPE
- Embeddings
- Next-token prediction
- Softmax
- Cross-entropy
- Sampling

Explorables:

- BPE merge workbench
- Token fertility comparison
- Logit and softmax editor
- Temperature, top-k, and top-p sampler

Project:

- Build a tokenizer and a small language model.

### Module 6 — Attention and transformers

Topics:

- Queries, keys, and values
- Scaled dot-product attention
- Causal masks
- Multi-head attention
- Positional information
- Transformer blocks
- Decoder-only models

Explorables:

- Query-key workbench
- Attention matrix
- Causal-mask toggle
- One-token transformer trace

Project:

- Implement and train a tiny decoder-only transformer.

### Module 7 — Open-weight models and inference

Topics:

- Model architecture versus checkpoint
- Base versus instruction models
- Model cards and licences
- Weight formats
- Prefill and decoding
- KV cache
- Quantisation
- Batching
- Local versus GPU inference

Explorables:

- Parameter memory calculator
- KV-cache viewer
- Quantisation error explorer
- Concurrency and latency simulator

Project:

- Benchmark the same model across multiple inference backends.

### Module 8 — Evaluation and data

Topics:

- Deterministic scoring
- Model judging
- Multiple trials
- Confidence and variance
- Contamination
- Data provenance
- Dataset quality
- Failure taxonomies

Explorables:

- Benchmark leakage laboratory
- Judge disagreement explorer
- Trial-count uncertainty
- Data deduplication visualisation

Project:

- Create a reproducible evaluation for one narrow capability.

### Module 9 — Fine-tuning and adaptation

Topics:

- Supervised fine-tuning
- LoRA
- Training and validation loss
- Overfitting
- Ablations
- Regression testing

Explorables:

- Low-rank matrix update
- Rank versus capacity
- Training improvement versus regression

Project:

- Fine-tune a small open-weight model and compare it against an untouched baseline.

### Module 10 — Tools, retrieval, and agents

Topics:

- Structured output
- Tool schemas
- Agent loops
- Context selection
- Retrieval
- Termination
- Sandboxing
- Prompt injection
- Agent evaluation

Explorables:

- Step-through agent loop
- Infinite-loop failure
- Retrieval chunking
- Tool-selection error
- Prompt-injection attack

Project:

- Build and evaluate a bounded, sandboxed tool-using agent.

### Module 11 — What next

Paths:

- Applied AI engineer
- ML or model engineer
- Inference systems engineer
- Evaluation and safety engineer
- Research engineer
- Open-weight contributor

The final module should help the learner choose a concrete next project rather than only list job titles.

## 20.5 Final project

The learner should:

1. Define a narrow model capability.
2. Establish a baseline.
3. Build a valid evaluation.
4. Improve the capability through code, data, or adaptation.
5. Analyse failures and regressions.
6. Publish a reproducible repository.

A generic chatbot wrapper does not satisfy the final project.

## 20.6 Open-weight contribution ladder

The course should show several legitimate contribution paths:

### Reproduce

- Run a project from source
- Reproduce an issue
- Verify a benchmark result

### Clarify

- Improve documentation
- Add examples
- Improve error messages
- Add a failing test

### Extend

- Add a model conversion
- Add an evaluation
- Add tokenizer support
- Add a compatibility path

### Optimise

- Improve latency
- Reduce memory
- Add quantisation
- Improve batching or caching

### Maintain

- Review contributions
- Maintain model support
- Curate a benchmark or dataset
- Coordinate releases

---

# 21. MVP

## 21.1 Runtime MVP

The first runtime release should support:

- `COURSE.md`
- Lesson Markdown
- YAML frontmatter
- `explorable` directive
- `exercise` directive
- TypeScript explorable bundling
- Sandboxed iframe execution
- Lesson navigation
- Local development server
- Structural validation
- Basic accessibility checks
- `AGENTS.md` and `CLAUDE.md` course templates
- Claude Code Desktop preview configuration
- Course scaffolding CLI
- Static `apps/site` landing page
- GitHub Pages deployment workflow
- Custom-domain configuration for `explorables.ai`

## 21.2 First course vertical slice

Do not build the entire AI curriculum before validating the format.

Build six lessons:

1. Gradient descent
2. Backpropagation
3. BPE tokenisation
4. Self-attention
5. Sampling and generation
6. Evaluation leakage

Each lesson should include:

- One strong explorable
- One prediction
- One focused coding exercise
- One broken case
- One explanation prompt

## 21.3 MVP success criteria

The MVP succeeds when:

- A learner can clone the course and start it in under ten minutes.
- Codex and Claude Code Desktop can open the local course in their browser or preview surfaces.
- All six lessons render without a backend.
- Explorables run in sandboxed iframes.
- The learner can move from an explorable to a real exercise directory.
- A new contributor can add a lesson using only the author guide.
- A course PR can be validated entirely in CI.
- The full experience works without login or remote tracking.
- The landing page builds as a static artifact.
- GitHub Actions deploys the landing page from `master`.
- The public repository is created at `Doppp/explorables` and uses the SSH remote and `master` branch.

---

# 22. Roadmap

## Phase 1 — Format, landing page, and vertical slice

- Canonical public GitHub repository
- Static landing page and GitHub Pages workflow
- Course folder convention
- Markdown parser
- Explorable contract
- Sandbox
- CLI
- Six AI lessons

## Phase 2 — Reference course

- Complete foundational AI course
- Shared visual component library
- More exercise templates
- Contribution documentation
- Static catalogue repository

## Phase 3 — Second course

Build a substantially different course such as:

- Coding Agents from First Principles
- Distributed Systems
- Databases
- Computer Networking

The second course will reveal which abstractions are genuinely reusable.

## Phase 4 — Optional distribution adapters

- Codex skill package
- Codex plugin
- Static site export
- Normal-browser course player
- Course registry UI

## Phase 5 — Optional enhancements

Only after demand is clear:

- Local resume state
- Audio assets
- Hosted course previews
- Cloud exercise runners
- Translations
- Visual authoring tools

---

# 23. Risks and mitigations

## 23.1 Arbitrary JavaScript in community courses

**Risk:** Course modules can execute malicious browser code.

**Mitigation:** Sandboxed iframes, restrictive CSP, no network by default, reviewed dependencies, trust labels, and explicit warnings for external courses.

## 23.2 Dependency supply-chain attacks

**Risk:** Installing a course may install compromised dependencies.

**Mitigation:** pnpm security defaults, committed lockfiles, build-script allowlists, CI audits, and minimal dependency policies.

## 23.3 Codex solves exercises for the learner

**Risk:** The tutor becomes a replacement rather than a teaching tool.

**Mitigation:** Strong `AGENTS.md` policy, protected solution paths, progressive hints, learner explanation requirements, and exercises designed around debugging and transfer.

## 23.4 Courses become complex applications

**Risk:** Authors spend more time building custom frontends than teaching.

**Mitigation:** Reusable component library, minimal module contract, strong examples, and a preference for one clear interactive representation per concept.

## 23.5 Markdown dialect expands uncontrollably

**Risk:** `explorables` becomes another proprietary content language.

**Mitigation:** Limit v1 to `explorable` and `exercise`. Add directives only when actual courses prove the need.

## 23.6 Course quality varies

**Risk:** Open submissions produce shallow or inaccurate material.

**Mitigation:** Catalogue review, public rubrics, subject reviewers, reproducible exercises, and clear distinction between reviewed and external courses.

## 23.7 TypeScript 7 ecosystem gaps

**Risk:** Some tools or language-service plugins lag behind the native TypeScript implementation.

**Mitigation:** Use standard `.ts` and `.tsx`, plain Markdown, no dependency on MDX/Astro/Vue/Svelte language-service plugins, and pin tested versions.

---

# 24. Brand

## 24.1 Product name

The product, runtime, CLI, public site, and open-source project are called:

```text
explorables
```

The name is styled in lowercase.

## 24.2 Public identity

```text
Product: explorables
Website: https://explorables.ai
Repository: git@github.com:Doppp/explorables.git
CLI: explorables
Package scope: @explorables/*
```

## 24.3 First course

```text
AI from First Principles
```

## 24.4 Tagline

```text
See how it works. Build it yourself.
```

## 24.5 Naming conventions

- Use `explorables` in prose and headings.
- Use `@explorables/*` for npm packages.
- Use `explorables` for the CLI executable.
- Use `explorables.ai` for the public site.
- Avoid legacy working names in code, files, and documentation.

---

# 25. Acceptance criteria for v1

## Course format

- [ ] A course can be represented entirely by a folder.
- [ ] The folder is understandable on GitHub without the `explorables` runtime.
- [ ] `COURSE.md` and lesson frontmatter validate.
- [ ] Only two custom directives are required.
- [ ] A course can contain no explorables and still render correctly.

## Runtime

- [ ] TypeScript 7 type checking passes.
- [ ] Course starts with one documented command.
- [ ] Markdown renders with sanitisation.
- [ ] Explorable modules compile without course-owned build config.
- [ ] Explorable modules run in sandboxed iframes.
- [ ] Explorable failures do not crash the whole course.
- [ ] Exercise links open the correct repository directory.
- [ ] Development errors include source file and line information.

## Agent hosts

- [ ] Opening the repository in Codex exposes useful `AGENTS.md` guidance.
- [ ] Opening the repository in Claude Code Desktop exposes useful `CLAUDE.md` guidance.
- [ ] “Start the course” launches the runtime in both supported hosts.
- [ ] Both hosts can open and inspect the local course page.
- [ ] Both hosts respect protected solution paths under normal course instructions.
- [ ] Both hosts can run exercise tests and explain failures.
- [ ] Host-specific adapters remain thin and do not fork course content.

## Public site and repository

- [ ] The repository exists publicly at `Doppp/explorables`.
- [ ] The default branch is `master`.
- [ ] The `origin` remote is `git@github.com:Doppp/explorables.git`.
- [ ] `apps/site` builds to static files.
- [ ] GitHub Pages deploys from `master` through GitHub Actions.
- [ ] The site is configured for `explorables.ai`.
- [ ] The landing page has no analytics or backend dependency.
- [ ] The landing page passes accessibility checks.

## Open source

- [ ] A contributor can scaffold a course.
- [ ] A contributor can add an explorable without changing the core runtime.
- [ ] CI validates a course from a clean checkout.
- [ ] Course licensing is explicit.
- [ ] External courses are clearly marked as unreviewed.

## First course

- [ ] Six vertical-slice lessons are complete.
- [ ] Each includes an explorable, exercise, failure case, and explanation prompt.
- [ ] At least five target learners complete two lessons.
- [ ] Setup failures and authoring friction are documented.
- [ ] Feedback informs the v1 format before the full course is produced.

---

# 26. Final product definition

`explorables` is:

> An open course format and local runtime for learning technical subjects through Markdown, interactive TypeScript modules, real exercises, and a Codex tutor.

A course author writes normal Markdown, imports explorables as TypeScript modules, includes exercises and tests, and submits the folder through ordinary open-source workflows.

A learner clones the course, opens it in Codex or Claude Code Desktop, and says:

> Start the course.

The coding-agent host handles guidance, code, files, tests, and discussion. The built-in browser or preview pane handles explanations, graphics, simulations, and interaction. The repository remains the source of truth. The same repository also publishes a basic static landing page at `explorables.ai`.

The first course, *AI from First Principles*, takes software developers from basic machine-learning concepts through transformers, open-weight models, evaluation, fine-tuning, agents, and a practical route toward AI engineering or open-source contribution.

---

# 27. Official technical references

These references informed the platform choices current as of July 2026:

- TypeScript 7.0 announcement:  
  https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/

- Node.js release status:  
  https://nodejs.org/en/about/previous-releases

- pnpm 11 release:  
  https://pnpm.io/blog/releases/11.0

- Codex built-in browser:  
  https://learn.chatgpt.com/docs/browser?surface=app

- Codex `AGENTS.md` instructions:  
  https://learn.chatgpt.com/docs/agent-configuration/agents-md

- Codex skills:  
  https://learn.chatgpt.com/docs/build-skills

- Codex plugins:  
  https://learn.chatgpt.com/docs/plugins

- Claude Code overview and Desktop setup:  
  https://docs.anthropic.com/en/docs/claude-code/overview  
  https://docs.anthropic.com/en/docs/claude-code/setup

- Claude Code memory and `CLAUDE.md`:  
  https://docs.anthropic.com/en/docs/claude-code/memory

- Claude Code skills:  
  https://docs.anthropic.com/en/docs/claude-code/skills


## Additional GitHub references

- GitHub Pages overview:  
  https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

- Custom GitHub Pages workflows:  
  https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

- Configuring a custom domain:  
  https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

- GitHub CLI repository creation:  
  https://docs.github.com/en/github-cli/github-cli/quickstart

- Changing the default branch:  
  https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/changing-the-default-branch
