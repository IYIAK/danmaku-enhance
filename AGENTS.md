# AGENTS.md

## Verification

A code change is done when `pnpm lint` passes and `pnpm build` has regenerated `dist/`. Whether a page actually behaves is checked by hand, so report runtime effects as unverified rather than building browser automation or live-site smoke tests.

## Scope

This repository is a standalone userscript. It contains no code from
[IronKinoko/agefans-enhance](https://github.com/IronKinoko/agefans-enhance) beyond
the MIT-licensed files listed in `LICENSE`; every source file under
`src/adapter/bilibili/` is maintained here. Do not reintroduce the upstream
`src/player`, `src/runtime`, or `src/utils` trees.

## Local browser workflow

- 使用 Codex 内置浏览器进行开发和效果验证；浏览器已配置好油猴脚本环境。
- 使用 `pnpm run dev` 启动开发环境。启动后，代码修改会自动生成新的编译结果。
- 修改代码后，刷新内置浏览器页面即可检查效果。
