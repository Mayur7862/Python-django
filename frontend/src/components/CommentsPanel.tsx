import { useMutation } from "@apollo/client";
import { ADD_COMMENT, GET_TASKS } from "../gql";
import { useState } from "react";

type Comment = { id: string; content: string; authorEmail: string; createdAt: string };
export default function CommentsPanel({
  taskId,
  projectId,
  comments,
}: {
  taskId: string;
  projectId: string;
  comments: Comment[];
}) {
  const [content, setContent] = useState("");
  const [me, setMe] = useState("");

  const [addComment, { loading }] = useMutation(ADD_COMMENT, {
    variables: { taskId, content, authorEmail: me },
    update(cache, { data }) {
      const nc = data?.addTaskComment?.taskComment;
      if (!nc) return;
      const existing: any = cache.readQuery({ query: GET_TASKS, variables: { projectId } });
      if (!existing) return;
      const nextTasks = existing.tasks.map((t: any) =>
        t.id === taskId ? { ...t, comments: [...(t.comments || []), nc] } : t
      );
      cache.writeQuery({ query: GET_TASKS, variables: { projectId }, data: { tasks: nextTasks } });
    },
    optimisticResponse: {
      addTaskComment: {
        __typename: "AddTaskComment",
        taskComment: {
          __typename: "TaskCommentType",
          id: "temp-" + Math.random(),
          content,
          authorEmail: me || "me@example.com",
          createdAt: new Date().toISOString(),
        },
      },
    },
    onCompleted() {
      setContent("");
    },
  });

  return (
    <div className="mt-2 rounded-2xl border border-zinc-200 bg-white p-3">
      <div className="mb-2 text-sm font-medium">Comments</div>
      <div className="space-y-2 max-h-56 overflow-auto">
        {(comments || []).map((c) => (
          <div key={c.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-2">
            <div className="text-xs text-zinc-600">{c.authorEmail}</div>
            <div className="text-sm">{c.content}</div>
            <div className="text-[11px] text-zinc-500">
              {new Date(c.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
        {!comments?.length && <div className="text-xs opacity-60">No comments yet.</div>}
      </div>

      <form
        className="mt-3 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (!content.trim() || !me.trim()) return;
          addComment();
        }}
      >
        <input
          className="w-full rounded-xl border border-zinc-300 px-2 py-1 text-sm sm:w-64"
          placeholder="Your email"
          value={me}
          onChange={(e) => setMe(e.target.value)}
        />
        <input
          className="flex-1 rounded-xl border border-zinc-300 px-2 py-1 text-sm"
          placeholder="Write a comment…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          disabled={loading}
          className="rounded-xl border border-[rgb(var(--brand-400))] bg-[rgb(var(--brand-500))] px-3 py-1 text-sm text-white disabled:opacity-60"
        >
          {loading ? "Posting…" : "Post"}
        </button>
      </form>
    </div>
  );
}
