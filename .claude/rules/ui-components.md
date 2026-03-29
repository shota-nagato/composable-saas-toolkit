---
paths:
  - "packages/ui/**/*.{ts,tsx}"
---

# UI Component Rules

## Design Tokens
全色はセマンティックトークンで参照。ハードコードした色は禁止。

```tsx
// GOOD
'bg-primary text-primary-foreground hover:bg-primary-hover'
'border-border text-foreground'

// BAD
'bg-blue-600 text-white hover:bg-blue-700'
```

トークン: primary, destructive, success, warning, foreground, muted, surface, border, ring

## Component Pattern
- `forwardRef` 必須
- ネイティブ HTML 属性を extend (`React.ButtonHTMLAttributes<HTMLButtonElement>`)
- `cn()` でクラス結合。consumer の `className` は常に最後: `cn('base', variant, className)`
- Variant は手動 Record map（CVA 不使用）
- `startIcon` / `endIcon` で icon slot（left/right ではなく logical direction）
- Radix UI は複雑な interactive component のみ（現在: Select, Dialog, DropdownMenu）

## Naming
- variant 値: semantic (`primary`, `destructive`)。visual name 禁止 (`blue`, `red`)
- size 値: T-shirt scale (`sm` / `md` / `lg`)
- Boolean props: `is` / `has` / `show` prefix
- Position props: `start` / `end`（RTL-safe）

## Export
1. `packages/ui/src/components/{name}.tsx` に作成
2. `packages/ui/src/index.ts` から value + type を export
3. `packages/ui/package.json` の `"exports"` にサブパスを追加
