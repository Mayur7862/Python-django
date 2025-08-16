import { Routes, Route, Link } from "react-router-dom";
import ProjectDashboard from "./components/ProjectDashboard";
import ProjectForm from "./components/ProjectForm";
import TaskBoard from "./components/TaskBoard";
import OrgPicker from "./components/OrgPicker";

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 p-3">
          <Link to="/" className="text-xl font-bold">Mini PM</Link>
          <div className="ml-auto">
            <OrgPicker />
          </div>
        </div>
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
