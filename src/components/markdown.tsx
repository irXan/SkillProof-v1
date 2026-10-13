import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A tiny, dependency-free Markdown renderer for the subset of syntax the AI
 * outputs use: headings, bold, inline code, bullet + numbered lists, and
 * paragraphs. Keeping this local avoids shipping a large markdown dependency
 * and guarantees the markup is sanitized (we never use dangerouslySetInnerHTML).
 */

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  const blocks = React.useMemo(() => parseBlocks(content), [content]);

  return (
    <div className={cn("space-y-3 text-sm leading-relaxed text-foreground/90", className)}>
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "hr" };

function parseBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let listBuffer: { ordered: boolean; items: string[] } | null = null;

  const flushList = () => {
    if (listBuffer && listBuffer.items.length > 0) {
      blocks.push({ type: "list", ...listBuffer });
    }
    listBuffer = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      flushList();
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (headingMatch) {
      flushList();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      flushList();
      blocks.push({ type: "hr" });
      continue;
    }

    const bulletMatch = /^[-*]\s+(.*)$/.exec(line);
    if (bulletMatch) {
      if (!listBuffer || listBuffer.ordered) {
        flushList();
        listBuffer = { ordered: false, items: [] };
      }
      listBuffer.items.push(bulletMatch[1].trim());
      continue;
    }

    const orderedMatch = /^\d+[.)]\s+(.*)$/.exec(line);
    if (orderedMatch) {
      if (!listBuffer || !listBuffer.ordered) {
        flushList();
        listBuffer = { ordered: true, items: [] };
      }
      listBuffer.items.push(orderedMatch[1].trim());
      continue;
    }

    flushList();
    blocks.push({ type: "paragraph", text: line.trim() });
  }

  flushList();
  return blocks;
}

function Block({ block }: { block: Block }) {
  switch (block.type) {
    case "heading": {
      const sizes: Record<number, string> = {
        1: "text-xl font-bold",
        2: "text-lg font-semibold",
        3: "text-base font-semibold text-teal-light",
        4: "text-sm font-semibold",
        5: "text-sm font-semibold",
        6: "text-sm font-semibold",
      };
      const Tag = `h${Math.min(block.level + 1, 6)}` as keyof JSX.IntrinsicElements;
      return (
        <Tag className={cn("mt-1 first:mt-0", sizes[block.level] ?? "text-base font-semibold")}>
          {renderInline(block.text)}
        </Tag>
      );
    }
    case "list":
      return block.ordered ? (
        <ol className="ml-5 list-decimal space-y-1.5">
          {block.items.map((item, index) => (
            <li key={index}>{renderInline(item)}</li>
          ))}
        </ol>
      ) : (
        <ul className="ml-5 list-disc space-y-1.5">
          {block.items.map((item, index) => (
            <li key={index}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    case "hr":
      return <hr className="my-2 border-border" />;
    default:
      return <p>{renderInline(block.text)}</p>;
  }
}

/** Handles **bold** and `inline code` within a line. */
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key++} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.8em] text-teal-light"
        >
          {token.slice(1, -1)}
        </code>,
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
