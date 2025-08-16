Mini PM — Multi-Tenant Project Management (Django + GraphQL + React)

A simple, functional project management tool with multi-tenant isolation by organization, a GraphQL API, and a React (TypeScript) + Apollo + Tailwind v4 frontend. Includes projects, tasks, drag-and-drop boards, assignees (at creation), comments, and delete.

This README walks you from zero → running on Windows/macOS/Linux, then gives a quick tutorial, API examples, and troubleshooting.

✨ Features

Multi-tenant: every request is scoped by X-Org-Slug header.

Projects: create, list, update; stats (task count, completed).

Tasks: create with assignee, update status, drag & drop between columns, delete.

Comments: add comments per task.

GraphQL API: via Graphene (Django).

Frontend: React 18 + TS, Apollo Client, Tailwind CSS v4.

🧱 Tech Stack

Backend: Python 3.11+, Django 4.x, Graphene (GraphQL), PostgreSQL

Frontend: React 18, TypeScript, Apollo Client, Vite, Tailwind v4

Dev: Node 18+ or 20+, npm; Docker optional for Postgres

📁 Repository Layout
mini-pm/
├─ backend/
│  ├─ core/                # Django project (settings, urls)
│  ├─ projects/            # App (models, schema, middleware)
│  ├─ manage.py
│  └─ requirements.txt
└─ frontend/
   ├─ src/
   │  ├─ apollo.ts
   │  ├─ gql.ts
   │  ├─ App.tsx
   │  ├─ main.tsx
   │  ├─ index.css
   │  └─ components/
   │     ├─ ProjectDashboard.tsx
   │     ├─ ProjectForm.tsx
   │     ├─ TaskBoard.tsx
   │     └─ CommentsPanel.tsx
   ├─ index.html
   ├─ package.json
   ├─ tailwind.config.cjs   # or tailwind.config.js with ESM export
   └─ postcss.config.cjs    # or postcss.config.js with ESM export

✅ Prerequisites

Python 3.11+

Node.js 18 or 20, npm 9+

PostgreSQL 13+ (local or Docker)

You can also use SQLite for quick testing by changing DATABASES in Django settings, but Postgres is recommended.

1) 🐘 Database (choose one)
Option A — Postgres via Docker (recommended)
docker run --name mini-pm-db -e POSTGRES_DB=pmdb \
  -e POSTGRES_USER=pmuser -e POSTGRES_PASSWORD=pmpass \
  -p 5432:5432 -d postgres:15

Option B — Local Postgres

Create a database and user:

CREATE DATABASE pmdb;
CREATE USER pmuser WITH ENCRYPTED PASSWORD 'pmpass';
GRANT ALL PRIVILEGES ON DATABASE pmdb TO pmuser;

2) ⚙️ Backend Setup
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate

pip install -r requirements.txt


Set environment (optional; defaults work):

# Windows (PowerShell)
$env:PGDATABASE="pmdb"
$env:PGUSER="pmuser"
$env:PGPASSWORD="pmpass"
$env:PGHOST="127.0.0.1"
$env:PGPORT="5432"
$env:DJANGO_DEBUG="True"

# macOS/Linux (bash/zsh)
export PGDATABASE=pmdb
export PGUSER=pmuser
export PGPASSWORD=pmpass
export PGHOST=127.0.0.1
export PGPORT=5432
export DJANGO_DEBUG=True


Run migrations:

python manage.py makemigrations
python manage.py migrate


Seed two organizations and one sample project/tasks (run the Django shell):

python manage.py shell

from projects.models import Organization, Project, Task
acme = Organization.objects.create(name="Acme Inc", slug="acme", contact_email="ops@acme.com")
globex = Organization.objects.create(name="Globex", slug="globex", contact_email="it@globex.com")
p = Project.objects.create(organization=acme, name="Website Revamp", status="ACTIVE")
Task.objects.create(project=p, title="Landing page", status="IN_PROGRESS", assignee_email="dev@acme.com")
Task.objects.create(project=p, title="Auth flow", status="TODO", assignee_email="be@acme.com")
exit()


Start the backend:

python manage.py runserver


Backend GraphQL endpoint:
http://localhost:8000/graphql/ (note the trailing slash)

Multi-tenancy header: All API calls must include X-Org-Slug: acme (or globex).

3) 🎨 Frontend Setup
cd ../frontend
npm install


Tailwind v4 config (already included):

postcss.config.cjs

module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};


tailwind.config.cjs

module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};


src/index.css

@import "tailwindcss";
:root { color-scheme: light; }
html, body, #root { height: 100%; }


Run the dev server:

npm run dev


Frontend: http://localhost:5173/

The frontend talks to the backend at http://localhost:8000/graphql/ and injects the multi-tenant header from localStorage.orgSlug (defaults to acme). Use the org picker in the header to switch.

🚀 Quick Tutorial (5 minutes)

Open http://localhost:5173/
You’ll see the Projects dashboard (for acme).

Create a project
Click + New, fill name/description/status → Create.
You’ll be redirected and see it on the dashboard.

Open a project
Click a project card to open the Task Board (3 columns).

Add tasks
Use the “Task title” + optional “Assignee email” → Add.
Tasks appear at the top of TODO.

Drag & drop
Drag tasks across columns (status persists) or reorder inside a column (UI remembers order in the session).

Comments
Click Comments on a task → post a comment (email + text).
It appends instantly and persists on refresh.

Delete
Click Delete on a card to remove a task (optimistic + real delete).

Multi-tenant
Switch org via the header select (e.g., globex).
You’ll see an isolated dataset per org.

🧪 Using GraphQL Directly

Open http://localhost:8000/graphql/ in the browser for the GraphiQL UI.

Important: add the header in the bottom-left “Headers” tab:

{
  "X-Org-Slug": "acme"
}

Sample Queries

List projects

query {
  projects {
    id name status description dueDate
    taskCount completedTasks
  }
}


List tasks for a project

query($projectId: ID!) {
  tasks(projectId: $projectId) {
    id title status assigneeEmail
    comments { id content authorEmail createdAt }
  }
}

Sample Mutations

Create project

mutation($name: String!, $description: String) {
  createProject(name: $name, description: $description) {
    project { id name status }
  }
}


Vars:

{ "name": "Onboarding", "description": "New employee onboarding" }


Create task

mutation($projectId: ID!, $title: String!, $assigneeEmail: String) {
  createTask(projectId: $projectId, title: $title, assignee_email: $assigneeEmail) {
    task { id title status assigneeEmail }
  }
}


Update task → move to DONE

mutation($id: ID!) {
  updateTask(id: $id, status: "DONE") {
    task { id status }
  }
}


Add comment

mutation($taskId: ID!, $content: String!, $authorEmail: String!) {
  addTaskComment(task_id: $taskId, content: $content, author_email: $authorEmail) {
    taskComment { id content authorEmail createdAt }
  }
}


Delete task

mutation($id: ID!) {
  deleteTask(id: $id) { ok deletedId }
}

🧩 Configuration
Backend (Django)

Settings: backend/core/settings.py

DEBUG=True for local dev.

ALLOWED_HOSTS=["*"] for local dev.

GRAPHENE["SCHEMA"] = "projects.schema.schema"

CORS enabled for the frontend origin.

Org middleware: projects.middleware.OrganizationFromHeaderMiddleware (adds request.organization based on X-Org-Slug).

Frontend (React)

GraphQL endpoint: src/apollo.ts

const httpLink = createHttpLink({ uri: "http://localhost:8000/graphql/" });


Org header:

const orgLink = setContext((_, { headers }) => {
  const orgSlug = localStorage.getItem("orgSlug") || "acme";
  return { headers: { ...headers, "X-Org-Slug": orgSlug } };
});

🛠️ Scripts
Backend
# from backend/
python manage.py runserver
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

Frontend
# from frontend/
npm run dev        # start Vite
npm run build      # production build
npm run preview    # preview build locally

🔐 Production Notes (brief)

Set DEBUG=False, configure ALLOWED_HOSTS and secure SECRET_KEY.

Serve Django behind a proper ASGI/WSGI server (e.g., gunicorn/uvicorn + nginx).

Configure CORS for your frontend domain.

Use a managed Postgres, set env vars via your host.

Build frontend (npm run build) and serve the static bundle from a CDN or from a static host; point it to your backend URL.

🧭 Troubleshooting (common fixes)
1) 404 or slash issues on /graphql

Use trailing slash: http://localhost:8000/graphql/

Or set APPEND_SLASH=False in Django settings (not recommended).

2) You must set settings.ALLOWED_HOSTS if DEBUG is False.

For dev, set DEBUG=True or set ALLOWED_HOSTS=["*"] (or your hostnames).

3) Tailwind errors like “unknown utility class”

Tailwind v4 needs:

@import "tailwindcss"; in src/index.css

PostCSS plugin @tailwindcss/postcss in postcss.config.cjs

Restart Vite after config changes: npm run dev

4) “Rendered more hooks than during the previous render”

Don’t put hooks after early return. Always call hooks at the top-level of your component.

5) TypeScript error with DnD (DropResult type)

Use type-only import:

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

6) Frontend blank white screen

Open DevTools Console; fix the error shown (often an import path or missing dep).

Verify src/main.tsx imports ./index.css.

Ensure index.html has <div id="root"></div> and <script type="module" src="/src/main.tsx">.

7) Project/task not appearing after create

We use refetchQueries on create to keep things robust. If you disabled it, re-enable or ensure Apollo cache updates correctly.

🧪 Optional: Persist Within-Column Order

Right now, within-column order is kept locally (so it feels immediate). If you want it persisted across refreshes:

Add position = models.IntegerField(default=0) to Task.

Set position on create / update.

Add a mutation updateTaskOrder(task_id, position) or a batch input.

Sort tasks by position in the GraphQL resolver.

If you want this, say the word — I’ll give you the Django migration + GraphQL + UI patch.

📝 License

MIT (or your preferred license).

🙌 Credits

This project uses:

Django, Graphene, Apollo, Tailwind v4

@hello-pangea/dnd (a maintained fork of react-beautiful-dnd)

That’s it!

You now have a multi-tenant PM tool running locally with a modern UI and a clean GraphQL API. If you want a one-click Docker Compose for backend + DB + frontend, or a deploy guide (Render/Fly/Heroku/Vercel), I can add those next.