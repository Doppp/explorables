# Open frontier course-family candidate source register

Status: candidate sources for planning
Checked: 28 July 2026

## How to use this register

This is not yet the immutable release manifest. It identifies suitable primary
artifacts for curriculum design. Before a lesson enters implementation, its
source row must be expanded with:

- exact paper and report revision;
- immutable repository commit;
- exact model-card revision;
- separate code and weight licences;
- base-weight, training-code, and data availability;
- evaluation protocol and required hardware;
- claim labels used by the lesson.

The commit recorded below is the official repository head observed during
planning. It is evidence of what was reviewed, not a promise to track that
branch.

This register feeds several independent courses. It does not make a source
eligible everywhere: each course must copy its selected rows into an immutable
course-local manifest and complete the selection gates before implementation.

## Candidate artifacts

| Case study | Candidate teaching use | Official repository and reviewed head | Repository licence signal | Release decision |
| --- | --- | --- | --- | --- |
| DeepSeek V3 | MLA, sparse MoE, FP8 training, DualPipe | [`deepseek-ai/DeepSeek-V3`](https://github.com/deepseek-ai/DeepSeek-V3) at `9b4e9788e4a3a731f7567338ed15d3ec549ce03b` | GitHub reports MIT for the repository | Candidate; verify report, weights, and evaluation terms separately |
| DeepSeek R1 | Verifiable rewards and reasoning post-training | [`deepseek-ai/DeepSeek-R1`](https://github.com/deepseek-ai/DeepSeek-R1) at `0cf78561f1d51c84a21b2190626b21116d5c68bb` | GitHub reports MIT for the repository | Candidate; distinguish published recipe from reproducible training stack |
| Kimi K2 | Sparse MoE and MuonClip | [`MoonshotAI/Kimi-K2`](https://github.com/MoonshotAI/Kimi-K2) at `1b4022bbb7187cf4011a8bdf0b4cd10e2daa26c4` | GitHub cannot assert a standard repository SPDX licence | Candidate; licence and weight terms require manual review |
| Kimi Linear | Delta/linear attention | [`MoonshotAI/Kimi-Linear`](https://github.com/MoonshotAI/Kimi-Linear) at `8c1d85eb6b5f8fcefb15758691b0ce50b0827ce3` | GitHub reports MIT for the repository | Candidate for the efficient-attention lesson |
| MiniMax M1 | Hybrid attention and long-context reasoning | [`MiniMax-AI/MiniMax-M1`](https://github.com/MiniMax-AI/MiniMax-M1) at `2abb4f45a9df4154b4bde024d51874bd127edcee` | GitHub reports Apache-2.0 for the repository | Candidate; verify model-weight terms separately |
| Qwen 3 | Dense/MoE comparison and hybrid reasoning | [`QwenLM/Qwen3`](https://github.com/QwenLM/Qwen3) at `7a2f61ffc7a20d47efcd2bf97f6f2bf52729042e` | GitHub does not report a repository SPDX identifier | Candidate; select exact model size and model-card licence before implementation |
| GLM 4.5 | MoE, agentic models, and hybrid reasoning | [`zai-org/GLM-4.5`](https://github.com/zai-org/GLM-4.5) at `170f20b2c10659008fdbc909d478bc2a75bc3627` | GitHub reports Apache-2.0 for the repository | Candidate; select exact base/instruct artifact and verify weight terms |

## Course routing

| Course | Candidate sources | Required freeze decision |
| --- | --- | --- |
| Open Frontier Models: Shared Techniques | Small configuration and artifact excerpts from several rows | Select only examples whose reuse terms support the shared teaching fixtures |
| Inside DeepSeek | DeepSeek V3 and R1 | Pin exact report/card revisions and separate architecture, reasoning, code, and weight claims |
| Inside Kimi | Kimi K2 and Kimi Linear | Resolve K2 repository/weight terms and pin the optimisation and attention sources |
| Inside Qwen | Qwen 3 | Select exact dense and MoE sizes plus base/instruction cards and licences |
| Inside MiniMax | MiniMax M1 | Pin the hybrid-attention report, code revision, weights, and long-context protocol |
| Inside GLM | GLM 4.5 | Select exact base/instruction artifacts and pin agentic evaluation protocols |

## Selection gates

A model becomes a course case study only when:

1. its public artifact demonstrates a distinct, teachable mechanism;
2. an official technical report, repository, or model card documents the
   mechanism;
3. a small deterministic implementation can expose a meaningful trade-off;
4. the course can state the simplification without implying full-model
   reproduction;
5. code, prose, figures, and weights used by the course have compatible
   licences;
6. the lesson remains useful after the named model is no longer current.

Very recent model releases should not replace a stable source merely because
they report a higher benchmark score. They enter only when they add a mechanism
that improves the educational comparison.
