"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Markdown renderer for Llavero assistant text.
 * - GFM enabled (tables, strikethrough, task lists).
 * - Inline-friendly: paragraphs and lists keep compact spacing so the chat
 *   bubble does not feel like a blog post.
 * - Links open in a new tab and use the brand color.
 */
export function MarkdownText({ children }: { children: string }) {
  return (
    <div className="prose-llavero">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 my-1.5 space-y-0.5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 my-1.5 space-y-0.5">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => <h3 className="font-display text-base font-bold mt-2 mb-1">{children}</h3>,
          h2: ({ children }) => <h3 className="font-display text-base font-bold mt-2 mb-1">{children}</h3>,
          h3: ({ children }) => <h3 className="font-display text-base font-semibold mt-2 mb-1">{children}</h3>,
          h4: ({ children }) => <h4 className="font-semibold text-sm mt-2 mb-0.5">{children}</h4>,
          strong: ({ children }) => <strong className="font-semibold text-[color:var(--color-fg)]">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="text-[color:var(--color-brand-700)] underline underline-offset-2 hover:opacity-80"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="px-1 py-0.5 rounded bg-[color:var(--color-bg)] border border-[color:var(--color-border)] text-[0.85em] font-mono">
              {children}
            </code>
          ),
          hr: () => <hr className="my-2 border-[color:var(--color-border)]" />,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[color:var(--color-brand-300)] pl-3 my-1.5 text-[color:var(--color-fg-muted)]">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="text-xs border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-[color:var(--color-border)] px-2 py-1 text-left font-semibold bg-[color:var(--color-bg)]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-[color:var(--color-border)] px-2 py-1 align-top">{children}</td>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
