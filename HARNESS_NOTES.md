# Why the loop is built this way

Sources read on 2026-11-04: [awesome-harness-engineering](https://github.com/ai-boost/awesome-harness-engineering), [best-of-Agent-Harnesses](https://github.com/RyanAlberts/best-of-Agent-Harnesses), [RAGFlow](https://github.com/infiniflow/ragflow).

| Idea from the lists | How it is used here |
|---|---|
| Memory tiers: small core memory, larger archival memory (Letta/MemGPT) | `Core rules` at the top of `memory/LEARNINGS.md` (always read); `memory/lessons.jsonl` is the archival tier (searched, never fully loaded) |
| Retrieve only the top-K relevant memories (agentmemory, engram) | `tools/qa/retrieve.py` ranks lessons with BM25 and returns the few that match the task |
| Hooks and sessions become lessons (claude-memory-compiler) | The `librarian` agent and `record_lesson.py` turn every round of user feedback into a structured lesson |
| Verification belongs inside the loop (Anthropic "Demystifying Evals", OpenAI skill evals) | `tools/qa/run_evals.py` blocks "ready" until palette, overlap, safe-zone, fact and credit checks pass |
| Mine failures into regression tests (auto-harness, AgentDebug error taxonomy) | Every mistake gets a category (`memory/error_taxonomy.md`) and, when testable, a case in `evals/cases.jsonl` |
| Independent judge, avoid "lucky passes" (AgentLens, LLM-as-judge) | The `critic` agent only sees frames and check output, never the editor's reasoning |
| Human judgment is the improvement signal (LangChain, HITL patterns) | Feedback is recorded verbatim; unclear feedback triggers one question, not a guess; user-confirmed lessons are marked |

## RAGFlow (not installed on purpose)
RAGFlow is a full retrieval platform that runs as a Docker service. It is worth adding when the memory outgrows a few hundred lessons or when you want to search the reel transcripts and reference frames in this repo. The plug-in point is `search()` in `tools/qa/retrieve.py`: replace its body with a call to a RAGFlow dataset and keep the same output format. Until then the built-in BM25 search has no setup and no cost.

## Honest limits
The system improves only as fast as feedback arrives: it remembers and enforces what it is told. The stand-in player in `render_frames.py` approximates the real Motion player, so a clean run means "no known mistakes", not "perfect". Palette lookalike colors in `memory/brand_blocklist.json` are approximate, not official brand values.
