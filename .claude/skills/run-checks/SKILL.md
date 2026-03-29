---
name: run-checks
description: Run all quality checks (biome, typecheck, test)
disable-model-invocation: true
allowed-tools: Bash
---

Run all quality checks and report results:

1. `pnpm check` (Biome lint + format)
2. `pnpm typecheck` (TypeScript)
3. `pnpm test` (Vitest)

If any check fails, analyze the output and suggest fixes.
If all pass, confirm success with a brief summary.
