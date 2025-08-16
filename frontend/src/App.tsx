import { Routes, Route, Link } from "react-router-dom";
import ProjectDashboard from "./components/ProjectDashboard";
import ProjectForm from "./components/ProjectForm";
import TaskBoard from "./components/TaskBoard";
import OrgPicker from "./components/OrgPicker";

export default function App() {
  return (
    <div className="min-h-screen">
      {/* BRAND HEADER */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 p-3">
          <Link
            to="/"
            className="rounded-2xl bg-gradient-to-r from-[rgb(var(--brand-600))] to-[rgb(var(--brand-400))] bg-clip-text text-xl font-extrabold text-transparent"
          >
            Taskify-lite
          </Link>

          <nav className="ml-auto flex items-center gap-2">
            <OrgPicker />
          </nav>
        </div>
        <div className="h-0.5 w-full bg-gradient-to-r from-[rgb(var(--brand-500))] via-[rgb(var(--brand-400))] to-transparent opacity-70" />
      </header>

      <main className="mx-auto max-w-6xl p-4">
        <Routes>
          <Route path="/" element={<ProjectDashboard />} />
          <Route path="/projects/new" element={<ProjectForm />} />
          <Route path="/projects/:id" element={<TaskBoard />} />
        </Routes>
      </main>
    </div>
  );
}
