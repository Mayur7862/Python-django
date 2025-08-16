import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import { GET_PROJECTS } from "../gql";

type Project = {
  id: string;
  name: string;
  description?: string | null;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD";
  taskCount: number;
  completedTasks: number;
  dueDate?: string | null;
};

export default function ProjectDashboard() {
  // Hooks: always called, in the same order
  const { data, loading, error } = useQuery(GET_PROJECTS);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"ALL" | Project["status"]>("ALL");

  // Derivations/hooks BEFORE any early returns
  const projects: Project[] = data?.projects ?? [];

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const qok =
        !q.trim() ||
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(q.toLowerCase());
      const sok = status === "ALL" || p.status === status;
      return qok && sok;
    });
  }, [projects, q, status]);

  const statusColor = (s: Project["status"]) =>
    s === "COMPLETED"
      ? "border-green-300 text-green-700"
      : s === "ON_HOLD"
      ? "border-amber-300 text-amber-700"
      : "border-blue-300 text-blue-700";

  // Render branches now only choose JSX
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 animate-pulse rounded bg-black/10" />
          <div className="h-9 w-24 animate-pulse rounded bg-black/10" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-2xl border p-4">
              <div className="h-5 w-1/2 animate-pulse rounded bg-black/10" />
              <div className="h-4 w-full animate-pulse rounded bg-black/10" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-black/10" />
              <div className="h-2 w-full animate-pulse rounded bg-black/10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) return <div className="text-red-600">Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">Projects</h1>
        <div className="ml-auto flex items-center gap-2">
          <input
            className="w-56 rounded-xl border px-3 py-2"
            placeholder="Search projects…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="rounded-xl border px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
          <Link
            to="/projects/new"
            className="rounded-2xl border px-3 py-2 hover:shadow"
          >
            + New
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((p) => {
          const pct = p.taskCount
            ? Math.round((p.completedTasks / p.taskCount) * 100)
            : 0;
          return (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              className="rounded-2xl border p-4 transition hover:shadow"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">{p.name}</div>
                <span
                  className={`text-xs rounded-xl border px-2 py-1 ${statusColor(
                    p.status
                  )}`}
                >
                  {p.status}
                </span>
              </div>
              {p.description && (
                <p className="mt-2 text-sm">{p.description}</p>
              )}
              <div className="mt-2 text-xs opacity-70">
                {p.completedTasks}/{p.taskCount} done
              </div>
              <div className="mt-2 h-2 rounded-full bg-black/10">
                <div
                  className="h-2 rounded-full bg-black"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {!filtered.length && (
        <div className="text-sm opacity-60">No projects match your filters.</div>
      )}
    </div>
  );
}
