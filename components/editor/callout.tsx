"use client"

import { Node, mergeAttributes } from "@tiptap/core"
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react"
import { CircleCheck, Info, Lightbulb, StickyNote, TriangleAlert } from "lucide-react"

export const CALLOUT_TONES = {
  note: { label: "Note", icon: StickyNote },
  info: { label: "Info", icon: Info },
  idea: { label: "Idée", icon: Lightbulb },
  success: { label: "Validé", icon: CircleCheck },
  warning: { label: "Attention", icon: TriangleAlert },
} as const

export type CalloutTone = keyof typeof CALLOUT_TONES
const ORDER = Object.keys(CALLOUT_TONES) as CalloutTone[]

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (tone?: CalloutTone) => ReturnType
    }
  }
}

function CalloutView({ node, updateAttributes, editor }: ReactNodeViewProps) {
  const tone = (node.attrs.tone as CalloutTone) in CALLOUT_TONES ? (node.attrs.tone as CalloutTone) : "note"
  const { icon: Icon, label } = CALLOUT_TONES[tone]
  const next = ORDER[(ORDER.indexOf(tone) + 1) % ORDER.length]

  return (
    <NodeViewWrapper className="callout" data-tone={tone}>
      <button
        type="button"
        contentEditable={false}
        className="callout-icon"
        title={`${label} · cliquer pour changer`}
        disabled={!editor.isEditable}
        onClick={() => updateAttributes({ tone: next })}
      >
        <Icon />
      </button>
      <NodeViewContent className="callout-content" />
    </NodeViewWrapper>
  )
}

export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      tone: {
        default: "note",
        parseHTML: (el) => el.getAttribute("data-tone") ?? "note",
        renderHTML: (attrs) => ({ "data-tone": attrs.tone }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "callout" }), 0]
  },

  addCommands() {
    return {
      setCallout:
        (tone = "note") =>
        ({ commands }) =>
          commands.wrapIn(this.name, { tone }),
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutView)
  },
})
