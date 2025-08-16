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

const badgeColors = (s: Project["status"]) =>
  s === "COMPLETED"
    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
    : s === "ON_HOLD"
    ? "bg-amber-100 text-amber-800 border-amber-200"
    : "bg-blue-100 text-blue-700 border-blue-200";

export default function ProjectDashboard() {
  const { data, loading, error } = useQuery(GET_PROJECTS);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"ALL" | Project["status"]>("ALL");

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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-40 animate-pulse rounded bg-black/10" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="h-5 w-2/3 animate-pulse rounded bg-black/10" />
              <div className="h-3 w-full animate-pulse rounded bg-black/10" />
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
        <h1 className="text-2xl font-semibold">Projects</h1>
        <div className="ml-auto flex items-center gap-2">
          <input
            className="w-64 rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-zinc-400"
            placeholder="Search projects…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-zinc-400"
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
            className="rounded-2xl border border-[rgb(var(--brand-400))] bg-[rgb(var(--brand-500))] px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-105"
          >
            + New
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((p) => {
          const pct = p.taskCount ? Math.round((p.completedTasks / p.taskCount) * 100) : 0;
          return (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              className="block rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">{p.name}</div>
                <span className={`rounded-full border px-2 py-0.5 text-xs ${badgeColors(p.status)}`}>
                  {p.status}
                </span>
              </div>

              {p.description && <p className="mt-2 text-sm text-zinc-700">{p.description}</p>}
              <div className="mt-2 text-xs text-zinc-600">{p.completedTasks}/{p.taskCount} done</div>

              <div className="mt-2 h-2 w-full rounded-full bg-zinc-200">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-[rgb(var(--brand-500))] to-[rgb(var(--brand-400))] transition-[width] duration-300"
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
