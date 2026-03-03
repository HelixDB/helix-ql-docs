# Helix CLI AI Onboarding: Implementation Plan and Checklist

This document captures the full implementation plan for improving `helix init` onboarding and adding AI skill scaffolding inspired by Autumn CLI.

## Scope

- Primary implementation repo: `helix-db/helix-cli`
- Docs and LLM context repo: `helix-ql-docs`

## Goals

- Add a first-class AI onboarding command: `helix ai setup`
- Integrate optional AI setup into `helix init`
- Fix init flow gaps (naming consistency, safe file generation, context-aware next steps)
- Update docs and LLM context files to remove stale commands

## Deliverables

- `helix ai setup` command with idempotent, non-destructive generation
- Optional clipboard copy for a starter AI setup prompt
- Hardened `helix init` behavior and output
- New/updated CLI v2 docs for AI setup
- Updated `llms.txt` and `llms-full.txt` command references
- Automated tests for generation and init behavior

---

## Phase 0: Finalize Product Spec

- [ ] Confirm command surface:
  - `helix ai setup [--path <PATH>] [--agents <list>] [-y|--yes] [--force] [--copy-prompt]`
- [ ] Confirm init flags:
  - `--ai`
  - `--ai-agents <list>`
  - `--ai-copy-prompt`
- [ ] Confirm default generated outputs:
  - Claude skills
  - Universal setup prompt
  - `AGENTS.md`
- [ ] Confirm optional outputs:
  - Cursor rules
  - Copilot instructions
  - Codex setup guidance

---

## Phase 1: Add CLI Surface in `helix-cli`

- [ ] Update `helix-cli/src/lib.rs`
  - [ ] Add `AiAction` enum
- [ ] Update `helix-cli/src/main.rs`
  - [ ] Add `Commands::Ai { action }`
  - [ ] Route to AI command handler
  - [ ] Add init flags for AI options
- [ ] Update `helix-cli/src/commands/mod.rs`
  - [ ] Export `pub mod ai;`
- [ ] Create `helix-cli/src/commands/ai.rs`
  - [ ] Add command dispatcher
  - [ ] Implement `setup` subcommand
  - [ ] Add summary output for created/updated/skipped/unchanged

---

## Phase 2: Implement AI Generation Engine

- [ ] Implement target agent parsing (`claude`, `cursor`, `copilot`, `codex`, `all`)
- [ ] Implement path resolution logic
  - [ ] Use `--path` when provided
  - [ ] Else use discovered project root when possible
  - [ ] Else fallback to current directory with warning
- [ ] Implement managed file writes
  - [ ] Create missing files
  - [ ] Skip unchanged files
  - [ ] Prompt or skip if existing files differ
  - [ ] Respect `--force`
- [ ] Include generation marker in managed files
- [ ] Implement command summary and clear next steps

---

## Phase 3: Prompt Copy UX

- [ ] Implement optional prompt copy support (`--copy-prompt`)
- [ ] Attempt clipboard copy on supported platforms
- [ ] If clipboard is unavailable, print fallback instructions and file path
- [ ] Ensure clipboard failure does not fail command

---

## Phase 4: Generated Templates and Content

### Core files (default)

- [ ] `.claude/skills/helix-author-hql/SKILL.md`
- [ ] `.claude/skills/helix-mcp-tools/SKILL.md`
- [ ] `.claude/skills/helix-cli-workflows/SKILL.md`
- [ ] `HELIX_AI_SETUP_PROMPT.md`
- [ ] `AGENTS.md`

### Optional files

- [ ] `.cursor/rules/helix.mdc`
- [ ] `.github/copilot-instructions.md`
- [ ] `CODEX_SETUP.md` (or equivalent guidance file)

### Template quality rules

- [ ] Include canonical current command map
  - `helix init`
  - `helix check`
  - `helix build`
  - `helix push`
  - `helix auth login`
  - `helix logs`
  - `helix sync`
  - `helix dashboard`
- [ ] Explicitly avoid stale commands in templates
  - no `helix deploy`
  - no `helix login`
  - no `helix pull` (until implemented)
  - no `helix install`

---

## Phase 5: Harden `helix init`

- [ ] Ensure `--name` is honored consistently for init subcommands where applicable
- [ ] Make scaffolding non-destructive
  - [ ] Do not silently overwrite existing `schema.hx`
  - [ ] Do not silently overwrite existing `queries.hx`
  - [ ] Do not silently overwrite existing `.gitignore`
  - [ ] Prompt in interactive mode
  - [ ] Skip with warning in non-interactive mode
- [ ] Improve next-step output
  - [ ] Local: show local-specific push/build flow
  - [ ] Cloud/Fly/ECR: show deployment-specific next commands
- [ ] AI integration in init
  - [ ] If `--ai`, run AI setup automatically after successful init
  - [ ] In interactive mode, ask whether to generate AI setup files
  - [ ] AI generation failures should warn but not invalidate successful init

---

## Phase 6: Prompt Helpers

- [ ] Extend `helix-cli/src/prompts.rs`
  - [ ] Reusable overwrite confirmation prompt
  - [ ] Reusable AI setup confirmation prompt
- [ ] Keep behavior consistent with existing interactive prompt style

---

## Phase 7: Tests

- [ ] Add `helix-cli/src/tests/ai_setup_tests.rs`
- [ ] Register module in `helix-cli/src/tests/mod.rs`
- [ ] Extend `helix-cli/src/tests/init_tests.rs`
  - [ ] Existing file preservation checks
  - [ ] Name handling checks
  - [ ] Init + AI setup flow checks
- [ ] Add AI setup test cases
  - [ ] Creates expected files on first run
  - [ ] Idempotent on second run
  - [ ] Existing edited files skip/prompt without force
  - [ ] `--force` updates managed files
  - [ ] Clipboard fallback behavior is non-fatal
- [ ] Run validation
  - [ ] `cargo check -p helix-cli`
  - [ ] `cargo test -p helix-cli`

---

## Phase 8: Docs and LLM Context (`helix-ql-docs`)

- [ ] Add `documentation/cli-v2/ai-setup.mdx`
- [ ] Update `documentation/cli-v2/command-reference.mdx`
  - [ ] Add `helix ai setup`
  - [ ] Add new `helix init` AI flags
- [ ] Update `documentation/cli-v2/getting-started.mdx`
  - [ ] Add optional AI setup step
- [ ] Update `docs.json`
  - [ ] Add AI setup page to navigation
- [ ] Clean stale command references in older docs
  - [ ] `documentation/getting-started/installation.mdx`
  - [ ] `documentation/getting-started/quick-start.mdx`
  - [ ] `documentation/getting-started/helixcli.mdx`
  - [ ] `helix-cloud/overview.mdx`
  - [ ] `documentation/cli-v2/workflows.mdx`
- [ ] Update LLM context files
  - [ ] `llms.txt` with current CLI commands and AI setup link
  - [ ] `llms-full.txt` with stale commands removed
- [ ] Validate docs locally
  - [ ] `mintlify dev`

---

## Delivery Strategy

- [ ] PR 1 (`helix-db`): `helix ai setup` + `helix init` hardening + tests
- [ ] PR 2 (`helix-ql-docs`): docs + `llms.txt` + `llms-full.txt` updates
- [ ] PR 3 (optional): template wording polish and follow-up improvements

---

## Definition of Done

- [ ] `helix ai setup` works in fresh and existing projects
- [ ] Re-running AI setup is idempotent and safe
- [ ] `helix init` does not silently overwrite starter files
- [ ] `helix init ... --name` behaves consistently
- [ ] AI setup can be executed directly or during init
- [ ] Prompt-copy flow works with graceful fallback
- [ ] Docs and LLM context no longer promote stale commands
- [ ] All relevant tests pass

---

## Post-MVP Enhancements (Nice to Have)

- [ ] Add `ai_setup` telemetry event in metrics
- [ ] Add `helix ai doctor` to validate generated setup files
- [ ] Add template versioning and migration for future updates
- [ ] Add selective regeneration with diff preview
