import type { JSONContent } from "@tiptap/react"

type Node = JSONContent

export interface TaskRef {
  /** Position de la tâche dans l'ordre du document */
  index: number
  text: string
  checked: boolean
  depth: number
}

function inlineText(node: Node | undefined): string {
  if (!node) return ""
  if (node.type === "text") return node.text ?? ""
  if (node.type === "mention") return `@${node.attrs?.label ?? ""}`
  if (node.type === "hardBreak") return " "
  return (node.content ?? []).map(inlineText).join("")
}

const BLOCK_TYPES = new Set([
  "paragraph",
  "heading",
  "codeBlock",
  "tableCell",
  "tableHeader",
  "detailsSummary",
])

export function docText(doc: Node | null | undefined): string {
  if (!doc) return ""
  const parts: string[] = []
  const walk = (node: Node) => {
    if (BLOCK_TYPES.has(node.type ?? "")) {
      const t = inlineText(node).trim()
      if (t) parts.push(t)
      return
    }
    node.content?.forEach(walk)
  }
  walk(doc)
  return parts.join(" ")
}

export function snippet(doc: Node | null | undefined, length = 140) {
  const text = docText(doc)
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text
}

export function wordCount(doc: Node | null | undefined) {
  const text = docText(doc)
  return text ? text.split(/\s+/).filter(Boolean).length : 0
}

export function collectTasks(doc: Node | null | undefined): TaskRef[] {
  const tasks: TaskRef[] = []
  if (!doc) return tasks
  const walk = (node: Node, depth: number) => {
    if (node.type === "taskItem") {
      const first = node.content?.find((c) => c.type === "paragraph")
      tasks.push({
        index: tasks.length,
        text: inlineText(first).trim(),
        checked: Boolean(node.attrs?.checked),
        depth,
      })
      node.content?.forEach((c) => walk(c, depth + 1))
      return
    }
    node.content?.forEach((c) => walk(c, depth))
  }
  walk(doc, 0)
  return tasks
}

export function setTaskChecked(doc: Node, index: number, checked: boolean): Node {
  let cursor = -1
  const walk = (node: Node): Node => {
    if (node.type === "taskItem") {
      cursor++
      const self = cursor === index ? { ...node, attrs: { ...node.attrs, checked } } : node
      return self.content ? { ...self, content: self.content.map(walk) } : self
    }
    return node.content ? { ...node, content: node.content.map(walk) } : node
  }
  return walk(doc)
}

export function appendTask(doc: Node | null, text: string): Node {
  const item: Node = {
    type: "taskItem",
    attrs: { checked: false },
    content: [{ type: "paragraph", content: text ? [{ type: "text", text }] : [] }],
  }
  const base: Node = doc?.content?.length ? doc : { type: "doc", content: [] }
  const content = [...(base.content ?? [])]
  const last = content[content.length - 1]
  if (last?.type === "taskList") {
    content[content.length - 1] = { ...last, content: [...(last.content ?? []), item] }
  } else {
    // On retire un éventuel paragraphe vide en fin de document
    if (last?.type === "paragraph" && !last.content?.length) content.pop()
    content.push({ type: "taskList", content: [item] })
  }
  return { ...base, content }
}

export function collectMentions(doc: Node | null | undefined): Set<string> {
  const ids = new Set<string>()
  const walk = (node: Node) => {
    if (node.type === "mention" && node.attrs?.id) ids.add(node.attrs.id)
    node.content?.forEach(walk)
  }
  if (doc) walk(doc)
  return ids
}

/* ---------- Export Markdown ---------- */

function marksToMd(node: Node, titleOf: (id: string) => string): string {
  if (node.type === "hardBreak") return "  \n"
  if (node.type === "mention") return `[[${titleOf(node.attrs?.id) || node.attrs?.label || "Page"}]]`
  if (node.type !== "text") return (node.content ?? []).map((n) => marksToMd(n, titleOf)).join("")
  let text = node.text ?? ""
  for (const mark of node.marks ?? []) {
    switch (mark.type) {
      case "bold":
        text = `**${text}**`
        break
      case "italic":
        text = `_${text}_`
        break
      case "strike":
        text = `~~${text}~~`
        break
      case "code":
        text = `\`${text}\``
        break
      case "highlight":
        text = `==${text}==`
        break
      case "link":
        text = `[${text}](${mark.attrs?.href ?? ""})`
        break
    }
  }
  return text
}

export function toMarkdown(doc: Node | null | undefined, titleOf: (id: string) => string) {
  if (!doc) return ""
  const inline = (n: Node | undefined) => (n ? (n.content ?? []).map((c) => marksToMd(c, titleOf)).join("") : "")

  const block = (node: Node, indent = ""): string => {
    switch (node.type) {
      case "paragraph":
        return indent + inline(node)
      case "heading":
        return `${"#".repeat(node.attrs?.level ?? 1)} ${inline(node)}`
      case "blockquote":
        return (node.content ?? [])
          .map((c) => block(c))
          .join("\n\n")
          .split("\n")
          .map((l) => `> ${l}`)
          .join("\n")
      case "callout":
        return (node.content ?? [])
          .map((c) => block(c))
          .join("\n\n")
          .split("\n")
          .map((l, i) => (i === 0 ? `> [!${node.attrs?.tone ?? "info"}]\n> ${l}` : `> ${l}`))
          .join("\n")
      case "codeBlock":
        return `\`\`\`${node.attrs?.language ?? ""}\n${inline(node)}\n\`\`\``
      case "horizontalRule":
        return "---"
      case "bulletList":
      case "orderedList":
      case "taskList":
        return (node.content ?? [])
          .map((item, i) => {
            const [first, ...rest] = item.content ?? []
            const bullet =
              node.type === "orderedList"
                ? `${i + 1}.`
                : node.type === "taskList"
                  ? `- [${item.attrs?.checked ? "x" : " "}]`
                  : "-"
            const head = `${indent}${bullet} ${first ? inline(first) : ""}`
            const tail = rest.map((c) => block(c, `${indent}  `))
            return [head, ...tail].join("\n")
          })
          .join("\n")
      case "details": {
        const summary = node.content?.find((c) => c.type === "detailsSummary")
        const body = node.content?.find((c) => c.type === "detailsContent")
        return `<details>\n<summary>${inline(summary)}</summary>\n\n${(body?.content ?? []).map((c) => block(c)).join("\n\n")}\n</details>`
      }
      case "table": {
        const rows = (node.content ?? []).map((row) =>
          (row.content ?? []).map((cell) =>
            (cell.content ?? []).map((c) => inline(c)).join(" ").replace(/\|/g, "\\|")
          )
        )
        if (!rows.length) return ""
        const head = `| ${rows[0].join(" | ")} |`
        const sep = `| ${rows[0].map(() => "---").join(" | ")} |`
        const body = rows.slice(1).map((r) => `| ${r.join(" | ")} |`)
        return [head, sep, ...body].join("\n")
      }
      default:
        return (node.content ?? []).map((c) => block(c, indent)).join("\n\n")
    }
  }

  return (doc.content ?? []).map((n) => block(n)).join("\n\n").trim()
}
