# GraphHire Prototype Prompt Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. It will decide whether each batch should run in parallel or serial subagent mode and will pass only task-local context to each subagent. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a new GPT-5.4-attributed, single-shot AI prototype prompt for GraphHire and save it in a new folder without modifying existing prompt files.

**Architecture:** The work is documentation-only. One new prompt document is created in a dedicated folder, and supporting spec and acceptance docs capture intent and verification. The prompt itself uses a product-director structure so AI prototype websites receive one coherent instruction set instead of fragmented wireframes.

**Tech Stack:** Markdown, git worktree, repository documentation structure

---

### Task 1: Prepare the target output location

**Files:**
- Create: `docs/原型图/gpt5.4/`

- [ ] **Step 1: Verify the target directory does not already contain the final file**

Run: `Get-ChildItem 'docs/原型图'`
Expected: Existing prompt assets are listed and `gpt5.4` may be absent or empty.

- [ ] **Step 2: Create the GPT-5.4 output directory if needed**

Run: `New-Item -ItemType Directory -Force 'docs/原型图/gpt5.4'`
Expected: PowerShell reports the directory exists.

- [ ] **Step 3: Verify the directory is available**

Run: `Get-ChildItem 'docs/原型图/gpt5.4'`
Expected: Command succeeds and returns an empty directory or the intended contents only.

### Task 2: Write the final prototype-generation prompt

**Files:**
- Create: `docs/原型图/gpt5.4/GraphHire-AI原型设计提示词-总提示词-平衡版-gpt5.4生成.md`
- Test: `docs/superpowers/acceptance/2026-04-19-graphhire-prototype-prompt-acceptance.md`

- [ ] **Step 1: Draft the final prompt document**

The document must contain:

```text
1. GPT-5.4 attribution header
2. Generation mission
3. Product and visual direction
4. User-side page requirements
5. Enterprise-side page requirements
6. Admin-side page requirements
7. Core business flows and states
8. Responsive and interaction constraints
9. Hard output constraints
```

- [ ] **Step 2: Save the prompt file**

Run: `Test-Path 'docs/原型图/gpt5.4/GraphHire-AI原型设计提示词-总提示词-平衡版-gpt5.4生成.md'`
Expected: `True`

- [ ] **Step 3: Verify the file contains GPT-5.4 attribution**

Run: `Select-String -Path 'docs/原型图/gpt5.4/GraphHire-AI原型设计提示词-总提示词-平衡版-gpt5.4生成.md' -Pattern '由 GPT-5.4 生成'`
Expected: One matching line is returned.

- [ ] **Step 4: Verify page coverage**

Run: `Select-String -Path 'docs/原型图/gpt5.4/GraphHire-AI原型设计提示词-总提示词-平衡版-gpt5.4生成.md' -Pattern '用户端|企业端|管理端|简历上传|职位管理|任务监控'`
Expected: Matches confirm all three terminals and representative pages are included.

### Task 3: Verify no existing prompt files were overwritten

**Files:**
- Test: `docs/原型图/GraphHire-AI原型设计提示词-minimax生成.md`
- Test: `docs/原型图/GraphHire-AI原型设计提示词-主要业务版.md`

- [ ] **Step 1: Confirm the original prompt files still exist**

Run: `Test-Path 'docs/原型图/GraphHire-AI原型设计提示词-minimax生成.md'; Test-Path 'docs/原型图/GraphHire-AI原型设计提示词-主要业务版.md'`
Expected: Both commands return `True`.

- [ ] **Step 2: Review git status**

Run: `git status --short`
Expected: New files appear under `docs/superpowers/` and `docs/原型图/gpt5.4/`, with no unrelated prompt file deletions.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-04-19-graphhire-prototype-prompt-design.md docs/superpowers/acceptance/2026-04-19-graphhire-prototype-prompt-acceptance.md docs/superpowers/plans/2026-04-19-graphhire-prototype-prompt.md docs/原型图/gpt5.4/GraphHire-AI原型设计提示词-总提示词-平衡版-gpt5.4生成.md
git commit -m "docs: 新增 GPT-5.4 原型提示词文档"
```

- [ ] **Step 4: Final verification**

Run: `git show --stat --oneline HEAD`
Expected: The commit summary shows only the four documentation files added for this task.
