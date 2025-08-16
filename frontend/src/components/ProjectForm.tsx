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
    update(cache, { data }) {
      const newProj = data?.createProject?.project;
      const existing: any = cache.readQuery({ query: GET_PROJECTS });
      if (existing && newProj) {
        cache.writeQuery({
          query: GET_PROJECTS,
          data: { projects: [newProj, ...existing.projects] },
        });
      }
    },
    optimisticResponse: {
      createProject: {
        __typename: "CreateProject",
        project: {
          __typename: "ProjectType",
          id: "temp-" + Math.random(),
          name,
          description,
          status,
          dueDate: null,
          taskCount: 0,
          completedTasks: 0,
        },
      },
    },
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createProject({ variables: { name, description, status } });
    nav("/");
  };

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 520 }}>
      <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>New Project</h1>
      <input
        required
        style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 12, marginBottom: 8 }}
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <select
        style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 12, marginBottom: 8 }}
        value={status}
        onChange={e => setStatus(e.target.value)}
      >
        <option>ACTIVE</option>
        <option>COMPLETED</option>
        <option>ON_HOLD</option>
      </select>
      <textarea
        style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 12, marginBottom: 8 }}
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      {error && <div style={{ color: "crimson", fontSize: 12 }}>{error.message}</div>}
      <button disabled={loading} style={{ padding: "8px 12px", border: "1px solid #333", borderRadius: 12 }}>
        {loading ? "Saving…" : "Create"}
      </button>
    </form>
  );
}
