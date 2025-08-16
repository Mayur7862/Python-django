import { FormEvent, useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_PROJECT, GET_PROJECTS } from "../gql";
import { useNavigate } from "react-router-dom";

export default function ProjectForm() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [description, setDescription] = useState("");

  const [createProject, { loading, error }] = useMutation(CREATE_PROJECT, {
    refetchQueries: [{ query: GET_PROJECTS }],
    awaitRefetchQueries: true,
    onCompleted() {
      nav("/");
    },
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createProject({ variables: { name, description, status } });
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-3 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h1 className="text-xl font-semibold">New Project</h1>

      <input
        className="w-full rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-zinc-400"
        placeholder="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <select
        className="w-full rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-zinc-400"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option>ACTIVE</option>
        <option>COMPLETED</option>
        <option>ON_HOLD</option>
      </select>

      <textarea
        className="w-full rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-zinc-400"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {error && <div className="text-xs text-red-600">{error.message}</div>}

      <button
        disabled={loading}
        className="rounded-2xl border border-[rgb(var(--brand-400))] bg-[rgb(var(--brand-500))] px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-105 disabled:opacity-60"
      >
        {loading ? "Saving…" : "Create"}
      </button>
    </form>
  );
}
