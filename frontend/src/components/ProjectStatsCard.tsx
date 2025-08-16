import { useQuery } from "@apollo/client";
import { GET_PROJECTS } from "../gql";

export default function ProjectStatsCard({ projectId }: { projectId: string }) {
  const { data, loading, error } = useQuery(GET_PROJECTS, { variables: { projectId } });

  if (loading) return <div className="border rounded-2xl p-3">Loading stats…</div>;
  if (error) return <div className="border rounded-2xl p-3 text-red-600">Stats error: {error.message}</div>;
  const s = data?.projectStats;
  if (!s) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <div className="border rounded-2xl p-3"><div className="text-xs opacity-60">Total</div><div className="text-xl font-semibold">{s.total}</div></div>
      <div className="border rounded-2xl p-3"><div className="text-xs opacity-60">To-Do</div><div className="text-xl font-semibold">{s.todo}</div></div>
      <div className="border rounded-2xl p-3"><div className="text-xs opacity-60">In Progress</div><div className="text-xl font-semibold">{s.inProgress}</div></div>
      <div className="border rounded-2xl p-3"><div className="text-xs opacity-60">Done</div><div className="text-xl font-semibold">{s.done}</div></div>
      <div className="border rounded-2xl p-3"><div className="text-xs opacity-60">Completion</div><div className="text-xl font-semibold">{s.completionRate.toFixed(1)}%</div></div>
    </div>
  );
}
