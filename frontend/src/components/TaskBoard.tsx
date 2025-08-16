import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_TASK, GET_TASKS, UPDATE_TASK } from "../gql";
import { useEffect, useMemo, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;
type Status = (typeof STATUSES)[number];

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: Status;
  assigneeEmail?: string | null;
  dueDate?: string | null;
};

const chipClass = (active: boolean) =>
  `text-xs px-2 py-1 rounded-full border transition ${
    active ? "bg-black text-white border-black" : "border-zinc-300 hover:bg-zinc-100"
  }`;

export default function TaskBoard() {
  const { id: projectId } = useParams();
  const { data, loading, error } = useQuery(GET_TASKS, { variables: { projectId } });

  // Quick add fields
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");

  // Local ordered ids per column (we own this after bootstrap)
  const [orderedIds, setOrderedIds] = useState<Record<Status, string[]>>({
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  });
  const bootstrapped = useRef(false);

  const tasks: Task[] = data?.tasks || [];

  // Map for rendering by id
  const taskById = useMemo(() => {
    const map: Record<string, Task> = {};
    for (const t of tasks) map[t.id] = t;
    return map;
  }, [tasks]);

  // ---- BOOTSTRAP ONLY ONCE ----
  // Build initial column order from server data one time (or when project changes)
  useEffect(() => {
    bootstrapped.current = false; // project changed → allow bootstrap
  }, [projectId]);

  useEffect(() => {
    if (loading || error) return;
    if (bootstrapped.current) return; // keep local order after first build
    setOrderedIds({
      TODO: tasks.filter((t) => t.status === "TODO").map((t) => t.id),
      IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS").map((t) => t.id),
      DONE: tasks.filter((t) => t.status === "DONE").map((t) => t.id),
    });
    bootstrapped.current = true;
  }, [loading, error, tasks, projectId]);

  // ---- MUTATIONS ----

  // Simpler & robust approach: refetch, then merge into local order
  const [createTask, { loading: creating }] = useMutation(CREATE_TASK, {
    refetchQueries: [{ query: GET_TASKS, variables: { projectId } }],
    awaitRefetchQueries: true,
    onCompleted(res) {
      const nt = res?.createTask?.task as Task | undefined;
      if (nt) {
        // put new task at top of TODO locally
        setOrderedIds((prev) => ({ ...prev, TODO: [nt.id, ...prev.TODO] }));
      }
    },
  });

  const [updateTask] = useMutation(UPDATE_TASK);

  // ---- UI HELPERS ----

  function reorder<T>(list: T[], startIndex: number, endIndex: number) {
    const result = list.slice();
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  function onDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const from = source.droppableId as Status;
    const to = destination.droppableId as Status;

    // Same column reorder → update local order only
    if (from === to) {
      setOrderedIds((prev) => ({
        ...prev,
        [from]: reorder(prev[from], source.index, destination.index),
      }));
      return;
    }

    // Cross column move → update local order AND persist status
    setOrderedIds((prev) => {
      const fromIds = prev[from].slice();
      const toIds = prev[to].slice();
      fromIds.splice(source.index, 1);
      toIds.splice(destination.index, 0, draggableId);
      return { ...prev, [from]: fromIds, [to]: toIds };
    });

    const moved = taskById[draggableId];
    if (!moved) return;

    updateTask({
      variables: { id: moved.id, status: to },
      // no cache writes: we trust our local order; server status change won’t overwrite it
    });
  }

  const columnTint = (s: Status) =>
    s === "DONE" ? "bg-emerald-50 border-emerald-100"
    : s === "IN_PROGRESS" ? "bg-blue-50 border-blue-100"
    : "bg-amber-50 border-amber-100";

  if (loading) return <div>Loading tasks…</div>;
  if (error) return <div className="text-red-600">Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      {/* Quick add (assignee only at creation) */}
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!title.trim()) return;
          await createTask({
            variables: {
              projectId,
              title,
              assigneeEmail: assignee || undefined,
              status: "TODO",
            },
          });
          setTitle("");
          setAssignee("");
        }}
      >
        <input
          className="flex-1 rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-zinc-400"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="w-full rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-zinc-400 sm:w-80"
          placeholder="Assignee email (optional)"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
        />
        <button
          disabled={creating}
          className="rounded-2xl border border-[rgb(var(--brand-400))] bg-[rgb(var(--brand-500))] px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-105 disabled:opacity-60"
        >
          {creating ? "Adding…" : "Add"}
        </button>
      </form>

      {/* DnD Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-4 md:grid-cols-3">
          {STATUSES.map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rounded-3xl border p-3 ${columnTint(status)} ${snapshot.isDraggingOver ? "ring-2 ring-[rgb(var(--brand-400))]" : ""}`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-semibold">{status.replace("_", " ")}</div>
                    <div className="rounded-full bg-white/80 px-2 py-0.5 text-xs text-zinc-700">
                      {orderedIds[status].length}
                    </div>
                  </div>

                  {!orderedIds[status].length && (
                    <div className="rounded-2xl border border-dashed border-zinc-300 p-4 text-sm opacity-60">
                      Drag tasks here
                    </div>
                  )}

                  <div className="space-y-2">
                    {orderedIds[status].map((taskId, index) => {
                      const t = taskById[taskId];
                      if (!t) return null;
                      return (
                        <Draggable key={t.id} draggableId={t.id} index={index}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              className={`rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm transition ${snap.isDragging ? "rotate-[1deg] shadow-md" : ""}`}
                            >
                              <div className="font-medium">{t.title}</div>
                              <div className="text-xs text-zinc-600">{t.assigneeEmail || "Unassigned"}</div>

                              <div className="mt-2 flex flex-wrap gap-2">
                                {STATUSES.map((s) => (
                                  <button
                                    key={s}
                                    className={chipClass(t.status === s)}
                                    onClick={() =>
                                      setOrderedIds((prev) => {
                                        // move locally
                                        const from = t.status;
                                        if (from === s) return prev;
                                        const fromIds = prev[from].slice();
                                        const toIds = prev[s].slice();
                                        const idx = fromIds.indexOf(t.id);
                                        if (idx > -1) fromIds.splice(idx, 1);
                                        toIds.unshift(t.id);
                                        // persist
                                        updateTask({ variables: { id: t.id, status: s } });
                                        return { ...prev, [from]: fromIds, [s]: toIds };
                                      })
                                    }
                                  >
                                    {s.replace("_", " ")}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
