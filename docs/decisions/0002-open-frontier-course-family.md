# ADR 0002: Use a shared frontier core and model-specific courses

Status: accepted Date: 28 July 2026 Supersedes: ADR 0001's decision to keep all frontier material in one course

## Context

ADR 0001 correctly required a complete Transformer foundation before frontier material and correctly identified the duplication risk in independent lab-centred courses. It resolved that risk by placing all techniques from DeepSeek, Kimi, Qwen, MiniMax, and GLM in one mechanism-centred course.

That resolution compresses too much subject matter into one course. It makes named labs examples rather than first-class objects of study, obscures how a lab combines techniques across releases, and prevents each model family from having its own source manifest, maintenance policy, and reconstruction capstone.

The PRD's Phase 3 proposes that the next course be substantially different in order to test runtime reuse. The accepted curriculum direction now prioritises an open-weight model-learning family first. This does not cancel a future substantially different course; it delays that abstraction test until the frontier family has exercised reuse across several technically related but independently versioned courses.

## Decision

Create a three-level learning path:

1. `AI from First Principles` supplies the common Transformer baseline.
2. `Open Frontier Models: Shared Techniques` teaches artifact reading, configuration normalisation, cost accounting, controlled comparison, claim labelling, and reproduction method.
3. Separate `Inside DeepSeek`, `Inside Kimi`, `Inside Qwen`, `Inside MiniMax`, and `Inside GLM` courses teach pinned lab-specific releases, combinations, exercises, and capstones.

The shared core prevents repeated fundamentals. Model courses remain independently runnable after the two common prerequisites and may not silently depend on one another.

Each model course must:

- freeze exact primary sources and licences before technical implementation;
- modify the versioned foundation artifact;
- own a distinct explorable/exercise sequence and controlled-reconstruction capstone;
- label claims as reported, reproduced, or inferred;
- state what its toy experiments cannot establish;
- run without required production weights, GPUs, accounts, APIs, or network services.

## Consequences

- The initiative contains seven courses rather than two.
- Shared research method and accounting remain durable across changing model releases.
- Each lab can be versioned, reviewed, maintained, and retired independently.
- Course transitions and source provenance require more explicit validation.
- Some mathematical utilities may be shared, but course prose and conclusions are not copied.
- The first model course, `Inside DeepSeek`, validates the shared/model boundary before the remaining four are implemented.
- A substantially different subject course remains on the longer-term runtime roadmap after the frontier family.

## Rejected alternatives

### Keep the single umbrella course

Rejected because eleven broad lessons cannot study five labs deeply while also serving as the common research-method prerequisite.

### Make every lab course fully independent

Rejected because it would duplicate artifact reading, parameter accounting, experiment design, and shared architecture foundations.

### Create informal tracks inside one course

Rejected because tracks would still share one version, source manifest, maintenance policy, and capstone boundary. They would not provide genuinely independent model courses.
