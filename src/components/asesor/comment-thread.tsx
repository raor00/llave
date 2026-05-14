"use client";

/**
 * Lista expandible de comentarios de una publicación con sus respuestas y un
 * input para responder cada comentario. Usado en /asesor/marketing. Llama a
 * replyCommentAction y agrega la respuesta de forma optimista.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { replyCommentAction } from "@/app/_actions/social";
import type { PostComment } from "@/lib/db/social-feed";

function timeAgo(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  return `${Math.floor(diffH / 24)}d`;
}

type LocalReply = { id: string; body: string; created_at: string; by: "me" };

function CommentRow({ comment }: { comment: PostComment }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState("");
  const [extra, setExtra] = useState<LocalReply[]>([]);

  function handleReply(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const temp: LocalReply = {
      id: `optimistic-${Date.now()}`,
      body: text,
      created_at: new Date().toISOString(),
      by: "me",
    };
    setExtra((prev) => [...prev, temp]);
    setDraft("");
    startTransition(async () => {
      await replyCommentAction(comment.id, text);
      router.refresh();
    });
  }

  const replies = [...comment.replies, ...extra];

  return (
    <li className="border-b border-[color:var(--color-border)] last:border-0 py-3">
      <div className="flex items-start gap-2.5">
        <span className="size-7 shrink-0 rounded-full bg-[color:var(--color-brand-100)] text-[color:var(--color-brand-700)] grid place-items-center font-semibold text-[11px]">
          {comment.author_initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold">{comment.author_name}</span>
            <span className="text-[10px] text-[color:var(--color-fg-soft)]">
              {timeAgo(comment.created_at)}
            </span>
          </div>
          <p className="text-sm leading-snug mt-0.5">{comment.body}</p>

          {replies.length > 0 && (
            <ul className="mt-2 space-y-1.5 pl-3 border-l-2 border-[color:var(--color-brand-100)]">
              {replies.map((r) => (
                <li key={r.id} className="text-xs">
                  <span className="font-semibold text-[color:var(--color-brand-700)]">
                    Tú
                  </span>{" "}
                  <span className="text-[10px] text-[color:var(--color-fg-soft)]">
                    {timeAgo(r.created_at)}
                  </span>
                  <p className="text-[color:var(--color-fg-muted)] leading-snug">
                    {r.body}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleReply} className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Responder…"
              className="input !py-1.5 text-xs flex-1"
            />
            <button
              type="submit"
              disabled={!draft.trim() || isPending}
              className="btn btn-outline text-xs !px-2.5 !py-1.5 shrink-0"
            >
              Responder
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}

export function CommentThread({ comments }: { comments: PostComment[] }) {
  if (comments.length === 0) {
    return (
      <p className="text-xs text-[color:var(--color-fg-soft)] py-2">
        Esta publicación todavía no tiene comentarios.
      </p>
    );
  }
  return (
    <ul>
      {comments.map((c) => (
        <CommentRow key={c.id} comment={c} />
      ))}
    </ul>
  );
}
