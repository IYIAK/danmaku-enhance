# AGENTS.md

## Verification

A code change is done when `pnpm lint` passes and `pnpm build` has regenerated `dist/`. Whether a page actually behaves is checked by hand, so report runtime effects as unverified rather than building browser automation or live-site smoke tests.

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`IronKinoko/agefans-enhance`), driven by the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles map to their default label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` plus `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Local browser workflow

- 使用 Codex 内置浏览器进行开发和效果验证；浏览器已配置好油猴脚本环境。
- 使用 `pnpm run dev` 启动开发环境。启动后，代码修改会自动生成新的编译结果。
- 修改代码后，刷新内置浏览器页面即可检查效果。
