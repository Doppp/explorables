# Open frontier course-family candidate source register

Status: candidate sources for planning Checked: 17 August 2026

## How to use this register

This is not yet the immutable release manifest. It identifies suitable primary artifacts for curriculum design. Before a lesson enters implementation, its source row must be expanded with:

- exact paper and report revision;
- immutable repository commit;
- exact model-card revision;
- separate code and weight licences;
- base-weight, training-code, and data availability;
- evaluation protocol and required hardware;
- claim labels used by the lesson.

The commit recorded below is the official repository head observed during planning. It is evidence of what was reviewed, not a promise to track that branch.

This register feeds several independent courses. It does not make a source eligible everywhere: each course must copy its selected rows into an immutable course-local manifest and complete the selection gates before implementation.

## Candidate artifacts

| Case study | Candidate teaching use | Official repository and reviewed head | Repository licence signal | Release decision |
| --- | --- | --- | --- | --- |
| DeepSeek V3 | MLA, sparse MoE, FP8 training, DualPipe | [`deepseek-ai/DeepSeek-V3`](https://github.com/deepseek-ai/DeepSeek-V3) at `9b4e9788e4a3a731f7567338ed15d3ec549ce03b` | GitHub reports MIT for the repository | Candidate; verify report, weights, and evaluation terms separately |
| DeepSeek R1 | Verifiable rewards and reasoning post-training | [`deepseek-ai/DeepSeek-R1`](https://github.com/deepseek-ai/DeepSeek-R1) at `0cf78561f1d51c84a21b2190626b21116d5c68bb` | GitHub reports MIT for the repository | Candidate; distinguish published recipe from reproducible training stack |
| DeepSeek V4 Pro and Flash | CSA/HCA hybrid attention, mHC, sparse-expert routing bootstrap, Muon, mixed FP4/FP8, domain-expert consolidation, and million-token evaluation | [Technical report `arXiv:2606.19348v1`](https://arxiv.org/abs/2606.19348v1); official model artifacts: [Pro](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/tree/b5968e9190ef611bbf34a7229255be88a0e937c1), [Pro Base](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-Base/tree/98730c030fbdbaca4950788280a35c4642b208a9), [Flash](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash/tree/60d8d70770c6776ff598c94bb586a859a38244f1), and [Flash Base](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Base/tree/8855555deef230a27a21a8d6f294b7b7497759b6) at the reviewed commits | Each reviewed artifact contains an MIT `LICENSE`; post-trained cards also declare MIT | Required current endpoint for the DeepSeek lineage; freeze report, artifact, inference-code, and evaluation revisions separately before implementation |
| Kimi K2 | Sparse MoE and MuonClip | [`MoonshotAI/Kimi-K2`](https://github.com/MoonshotAI/Kimi-K2) at `1b4022bbb7187cf4011a8bdf0b4cd10e2daa26c4` | GitHub cannot assert a standard repository SPDX licence | Candidate; licence and weight terms require manual review |
| Kimi Linear | Delta/linear attention | [`MoonshotAI/Kimi-Linear`](https://github.com/MoonshotAI/Kimi-Linear) at `8c1d85eb6b5f8fcefb15758691b0ce50b0827ce3` | GitHub reports MIT for the repository | Candidate for the efficient-attention lesson |
| Kimi K3 | KDA, gated MLA, Stable LatentMoE, AttnRes, SiTU-GLU, native quantisation, and long-context architecture | [`MoonshotAI/Kimi-K3`](https://github.com/MoonshotAI/Kimi-K3) at `3cb39dfd32e51c3328e2e4b4af21341247d06c43`; [technical report](https://arxiv.org/abs/2607.24653) | Repository and weights use the custom Kimi K3 License; review its commercial-service and attribution conditions before reuse | Required endpoint for the Kimi architecture lineage; freeze the report, code, weights, and evaluation protocols separately |
| MiniMax M1 | Hybrid attention and long-context reasoning | [`MiniMax-AI/MiniMax-M1`](https://github.com/MiniMax-AI/MiniMax-M1) at `2abb4f45a9df4154b4bde024d51874bd127edcee` | GitHub reports Apache-2.0 for the repository | Candidate; verify model-weight terms separately |
| Qwen 3 | Dense/MoE comparison and hybrid reasoning | [`QwenLM/Qwen3`](https://github.com/QwenLM/Qwen3) at `7a2f61ffc7a20d47efcd2bf97f6f2bf52729042e` | GitHub does not report a repository SPDX identifier | Candidate; select exact model size and model-card licence before implementation |
| GLM 4.5 | MoE, agentic models, and hybrid reasoning | [`zai-org/GLM-4.5`](https://github.com/zai-org/GLM-4.5) at `170f20b2c10659008fdbc909d478bc2a75bc3627` | GitHub reports Apache-2.0 for the repository | Retained as historical lineage; no longer the endpoint for the first GLM course |
| GLM 5 and GLM 5.2 | Sparse MoE, DSA, cross-layer index reuse, MTP/speculative decoding, reasoning effort, long-context and agentic evaluation | [`zai-org/GLM-5`](https://github.com/zai-org/GLM-5) at `25206af860c4ac10f6411c597c574f9b1c00e53c`; [GLM 5 report `arXiv:2602.15763v2`](https://arxiv.org/abs/2602.15763v2); [IndexCache `arXiv:2603.12201v1`](https://arxiv.org/abs/2603.12201v1); official [GLM 5.2 BF16](https://huggingface.co/zai-org/GLM-5.2/tree/b4734de4facf877f85769a911abafc5283eab3d9) and [FP8](https://huggingface.co/zai-org/GLM-5.2-FP8/tree/ba978f7d347eaf65d22f1a86833408afdb953541) artifacts at the reviewed commits | GLM-5 code repository is Apache-2.0; both reviewed GLM 5.2 weight artifacts declare MIT | Required current endpoint for the GLM course; freeze the GLM 5 report revision, 5.2 release page, cards/configs, serving assumptions, and evaluation protocols separately |

## Course routing

| Course | Candidate sources | Required freeze decision |
| --- | --- | --- |
| Open Frontier Models: Shared Techniques | Small configuration and artifact excerpts from several rows | Select only examples whose reuse terms support the shared teaching fixtures |
| Inside DeepSeek | DeepSeek V4 Pro/Flash, with V3 and R1 as lineage | Pin exact report/card revisions and separate architecture, optimisation, post-training, reasoning, code, weight, and harness claims |
| Inside Kimi | Kimi K2, Kimi Linear, and Kimi K3 | Resolve K2 terms; pin the Kimi Linear and K3 attention sources; review the K3 custom licence; distinguish architecture, multimodal, quantisation, and benchmark claims |
| Inside Qwen | Qwen 3 | Select exact dense and MoE sizes plus base/instruction cards and licences |
| Inside MiniMax | MiniMax M1 | Pin the hybrid-attention report, code revision, weights, and long-context protocol |
| Inside GLM | GLM 5.2, with GLM 5 as lineage | Pin BF16/FP8 artifacts, distinguish the release's `IndexShare` name from the linked `IndexCache` paper, and pin serving and agentic evaluation protocols |

## 17 August 2026 release refresh

The first DeepSeek course now ends at V4 rather than V3/R1. V3 and R1 remain necessary lineage sources: V4 changes the attention and residual architecture while building on sparse-expert and reasoning work that those releases document. The course must compare Pro and Flash as two sizes in one V4 family, not treat their benchmark difference as a controlled architecture ablation.

The first GLM course now ends at GLM 5.2 rather than GLM 4.5. GLM 5 supplies the available architecture and post-training report; GLM 5.2 supplies the current configuration, weights, IndexShare deployment pattern, MTP changes, and long-horizon evaluation claims. Z.ai links the name `IndexShare` to the paper titled *IndexCache: Accelerating Sparse Attention via Cross-Layer Index Reuse*. Course prose must preserve both names and their scopes rather than silently treating them as independently documented mechanisms.

These are candidate-source updates, not immutable course-local manifests. The reviewed commits make the planning decision auditable, but each course still must complete its source-freeze and licence gates before technical lessons are implemented.

## Selection gates

A model becomes a course case study only when:

1. its public artifact demonstrates a distinct, teachable mechanism;
2. an official technical report, repository, or model card documents the mechanism;
3. a small deterministic implementation can expose a meaningful trade-off;
4. the course can state the simplification without implying full-model reproduction;
5. code, prose, figures, and weights used by the course have compatible licences;
6. the lesson remains useful after the named model is no longer current.

Very recent model releases should not replace a stable source merely because they report a higher benchmark score. They enter only when they add a mechanism that improves the educational comparison.
