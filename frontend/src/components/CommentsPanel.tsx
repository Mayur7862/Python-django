import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_TASK, GET_TASKS, UPDATE_TASK } from "../gql";
import { useState } from "react";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;

export default function TaskBoard() {
  const { id } = useParams(); // project id
  const { data, loading, error } = useQuery(GET_TASKS, { variables: { projectId: id } });
  const [title, setTitle] = useState("");

  const [createTask] = useMutation(CREATE_TASK, {
    variables: { projectId: id, title },
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
      const existing: any = cache.readQuery({ query: GET_TASKS, variables: { projectId: id } });
      if (existing && newTask) {
        cache.writeQuery({
          query: GET_TASKS,
          variables: { projectId: id },
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

  return (
    <div className="space-y-4">
      <form
        className="flex gap-2"
        onSubmit={e => {
          e.preventDefault();
          if (title.trim()) {
            createTask();
            setTitle("");
          }
        }}
      >
        <input className="flex-1 border rounded-xl p-2" placeholder="Quick add task title" value={title} onChange={e => setTitle(e.target.value)} />
        <button className="px-3 py-2 rounded-xl bg-black text-white">Add</button>
      </form>

      <div className="grid md:grid-cols-3 gap-4">
        {STATUSES.map(status => (
          <div key={status} className="rounded-2xl border p-3">
            <div className="font-semibold mb-2">{status}</div>
            <div className="space-y-2">
              {byStatus(status).map((t: any) => (
                <div key={t.id} className="rounded-xl border p-3">
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs opacity-70">{t.assigneeEmail || "Unassigned"}</div>
                  <div className="flex gap-2 mt-2">
                    {STATUSES.map(s => (
                      <button
                        key={s}
                        onClick={() =>
                          updateTask({
                            variables: { id: t.id, status: s },
                            optimisticResponse: { updateTask: { __typename: "UpdateTask", task: { ...t, status: s } } },
                          })
                        }
                        className={`text-xs px-2 py-1 border rounded ${t.status === s ? "bg-black text-white" : ""}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {!byStatus(status).length && <div className="text-sm opacity-60">No tasks</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
