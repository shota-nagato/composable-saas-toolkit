---
name: new-component
description: Create a new UI component in packages/ui following design system conventions
argument-hint: [component-name]
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob
---

Create a new UI component named $ARGUMENTS in packages/ui.

## Steps

1. Read existing component patterns for reference:
   - `packages/ui/src/components/button.tsx` (variant map pattern)
   - `packages/ui/src/components/input.tsx` (forwardRef + native attributes)
   - `packages/ui/src/lib/utils.ts` (cn utility)
   - `packages/ui/src/tokens.css` (available design tokens)

2. Create `packages/ui/src/components/$ARGUMENTS.tsx`:
   - Use `forwardRef`
   - Extend appropriate native HTML attributes
   - Use `cn()` with token-based classes only (never hardcoded colors)
   - Add variant/size props if appropriate (use Record maps, not CVA)
   - Consumer `className` always comes last in `cn()`

3. Export from `packages/ui/src/index.ts` (both value and type)

4. Add sub-path export to `packages/ui/package.json` under `"exports"`:
   ```json
   "./$ARGUMENTS": "./src/components/$ARGUMENTS.tsx"
   ```

5. Verify with `pnpm typecheck`
