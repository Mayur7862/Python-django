import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_TASK, GET_TASKS, UPDATE_TASK } from "../gql";
import { useState } from "react";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;

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
  const chip = (active: boolean) =>
    `text-xs px-2 py-1 rounded-xl border ${active ? "bg-black text-white" : ""}`;

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
          className="flex-1 rounded-xl border p-2"
          placeholder="Quick add task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="rounded-2xl border px-3 py-2 hover:shadow">Add</button>
      </form>

      <div className="grid gap-4 md:grid-cols-3">
        {STATUSES.map((status) => (
          <div key={status}>
            <div className="mb-2 font-semibold">{status.replace("_", " ")}</div>

            {!byStatus(status).length && (
              <div className="rounded-2xl border p-3 opacity-60">No tasks</div>
            )}

            {byStatus(status).map((t: any) => (
              <div key={t.id} className="mb-2 rounded-2xl border p-3">
                <div className="font-medium">{t.title}</div>
                <div className="text-xs opacity-70">{t.assigneeEmail || "Unassigned"}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      className={chip(t.status === s)}
                      onClick={() =>
                        updateTask({
                          variables: { id: t.id, status: s },
                          optimisticResponse: {
                            updateTask: {
                              __typename: "UpdateTask",
                              task: { ...t, status: s },
                            },
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
        ))}
      </div>
    </div>
  );
}
