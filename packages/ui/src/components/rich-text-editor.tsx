import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import type { Editor } from '@tiptap/react'
import { EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import * as React from 'react'
import BlockquoteIcon from '../assets/svg/toolbar/blockquote.svg?react'
import BoldIcon from '../assets/svg/toolbar/bold.svg?react'
import BulletListIcon from '../assets/svg/toolbar/bullet-list.svg?react'
import CodeIcon from '../assets/svg/toolbar/code.svg?react'
import CodeBlockIcon from '../assets/svg/toolbar/code-block.svg?react'
import ItalicIcon from '../assets/svg/toolbar/italic.svg?react'
import OrderedListIcon from '../assets/svg/toolbar/ordered-list.svg?react'
import StrikeIcon from '../assets/svg/toolbar/strikethrough.svg?react'
import { cn } from '../lib/utils'

export interface RichTextEditorProps {
  content: string | null
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  autofocus?: boolean
  onBlur?: () => void
}

const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ content, onChange, placeholder, className, autofocus, onBlur }, ref) => {
    const onChangeRef = React.useRef(onChange)
    const onBlurRef = React.useRef(onBlur)
    React.useEffect(() => {
      onChangeRef.current = onChange
    }, [onChange])
    React.useEffect(() => {
      onBlurRef.current = onBlur
    }, [onBlur])

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
        }),
        Placeholder.configure({
          placeholder: placeholder ?? 'Write something...',
        }),
        Link.configure({
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        }),
      ],
      content: content ?? '',
      autofocus,
      editorProps: {
        attributes: {
          class: 'tiptap-content outline-none',
        },
      },
      onUpdate: ({ editor: e }) => {
        onChangeRef.current(e.getHTML())
      },
      onBlur: () => {
        onBlurRef.current?.()
      },
    })

    React.useEffect(() => {
      if (editor && !editor.isFocused) {
        editor.commands.setContent(content ?? '')
      }
    }, [editor, content])

    return (
      <div
        ref={ref}
        className={cn(
          'rich-text-editor rounded-md text-sm text-foreground',
          className,
        )}
      >
        {editor && <Toolbar editor={editor} />}
        <EditorContent editor={editor} />
      </div>
    )
  },
)
RichTextEditor.displayName = 'RichTextEditor'

export { RichTextEditor }

/** Check whether an HTML string has no visible text content. */
export function isEmptyHtml(html: string | null | undefined): boolean {
  if (!html) return true
  const text = html.replace(/<[^>]*>/g, '').trim()
  return text.length === 0
}

/* ------------------------------------------------------------------ */
/*  Toolbar                                                           */
/* ------------------------------------------------------------------ */

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-0.5">
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          label="Bold"
        >
          <BoldIcon aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          label="Italic"
        >
          <ItalicIcon aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          label="Strikethrough"
        >
          <StrikeIcon aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          label="Inline code"
        >
          <CodeIcon aria-hidden="true" />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      <ToolbarGroup>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive('heading', { level: 1 })}
          label="Heading 1"
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive('heading', { level: 2 })}
          label="Heading 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive('heading', { level: 3 })}
          label="Heading 3"
        >
          H3
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          label="Bullet list"
        >
          <BulletListIcon aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          label="Ordered list"
        >
          <OrderedListIcon aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          label="Blockquote"
        >
          <BlockquoteIcon aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          label="Code block"
        >
          <CodeBlockIcon aria-hidden="true" />
        </ToolbarButton>
      </ToolbarGroup>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Toolbar primitives                                                */
/* ------------------------------------------------------------------ */

function ToolbarButton({
  onClick,
  isActive,
  label,
  children,
}: {
  onClick: () => void
  isActive: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
      className={cn(
        'flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-xs font-medium transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted hover:bg-surface-hover hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>
}

function ToolbarDivider() {
  return <div className="mx-1 h-4 w-px bg-border" />
}
