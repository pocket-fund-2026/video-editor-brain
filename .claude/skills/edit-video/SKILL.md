---
name: edit-video
description: Make or revise a video with the self-improving loop: retrieve lessons, build scene by scene, run the checks, get a critic review, then record the user's feedback as new lessons. Use for any video, reel or motion-graphics task.
---
1. Librarian: retrieve lessons for this task (`tools/qa/retrieve.py`).
2. Brief: reference video + palette, length, platform, narration, audience. Ask only what is missing.
3. Script, then a plan; show the plan before building.
4. Editor: build one scene at a time; preview early.
5. QA: `render_frames.py --sheet`, look at the sheets, `run_evals.py` must say READY TO SHOW.
6. Critic: review frames + check output only; fix findings.
7. Show the user. Say which lesson ids were applied.
8. Librarian: record the user's feedback verbatim (`record_lesson.py`), add a check if testable, promote repeated rules.
