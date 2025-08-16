import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_TASK, GET_TASKS, UPDATE_TASK } from "../gql";
import { useState } from "react";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;

const chipClass = (active: boolean) =>
  `text-xs px-2 py-1 rounded-full border transition ${
    active ? "bg-black text-white border-black" : "border-zinc-300 hover:bg-zinc-100"
  }`;

export default function TaskBoard() {
  const { id: projectId } = useParams();
  const { data, loading, error } = useQuery(GET_TASKS, { variables: { projectId } });
  const [title, setTitle] = useState("");

  const [createTask] = useMutation(CREATE_TASK, {
    variables: { projectId, title },
    optimisticResponse: {
      createTask: {
        __typename: "CreateTask",
        task: {
          __typename: "TaskType",
          id: "temp-" + Math.random(),
          title,
          description: "",
          status: "TODO",
          assigneeEmail: "",
          dueDate: null,
        },
      },
    },
    update(cache, { data }) {
      const newTask = data?.createTask?.task;
      const existing: any = cache.readQuery({ query: GET_TASKS, variables: { projectId } });
      if (existing && newTask) {
        cache.writeQuery({
          query: GET_TASKS,
          variables: { projectId },
          data: { tasks: [newTask, ...existing.tasks] },
        });
      }
    },
  });

  const [updateTask] = useMutation(UPDATE_TASK);

  if (loading) return <div>Loading tasks…</div>;
  if (error) return <div className="text-red-600">Error: {error.message}</div>;

  const tasks = data?.tasks || [];
  const byStatus = (s: string) => tasks.filter((t: any) => t.status === s);

  const columnTint = (s: string) =>
    s === "DONE" ? "bg-emerald-50 border-emerald-100"
    : s === "IN_PROGRESS" ? "bg-blue-50 border-blue-100"
    : "bg-amber-50 border-amber-100";

  return (
    <div className="space-y-4">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim()) {
            createTask();
            setTitle("");
          }
        }}
      >
        <input
          className="flex-1 rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-zinc-400"
          placeholder="Quick add task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="rounded-2xl border border-[rgb(var(--brand-400))] bg-[rgb(var(--brand-500))] px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-105">
          Add
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-3">
        {STATUSES.map((status) => (
          <div key={status} className={`rounded-3xl border p-3 ${columnTint(status)}`}>
            <div className="mb-2 flex items-center justify-between">
              <div className="font-semibold">{status.replace("_", " ")}</div>
              <div className="rounded-full bg-white/80 px-2 py-0.5 text-xs text-zinc-700">
                {byStatus(status).length}
              </div>
            </div>

            {!byStatus(status).length && (
              <div className="rounded-2xl border border-dashed border-zinc-300 p-4 text-sm opacity-60">
                No tasks
              </div>
            )}

            <div className="space-y-2">
              {byStatus(status).map((t: any) => (
                <div key={t.id} className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-zinc-600">{t.assigneeEmail || "Unassigned"}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        className={chipClass(t.status === s)}
                        onClick={() =>
                          updateTask({
                            variables: { id: t.id, status: s },
                            optimisticResponse: {
                              updateTask: { __typename: "UpdateTask", task: { ...t, status: s } },
                            },
                          })
                        }
                      >
                        {s.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
