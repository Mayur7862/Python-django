# 🗂️ Mini Project Management Tool

A full‑stack **Project Management** app with **multi‑tenancy**, a **GraphQL API**, and a modern **React (TypeScript) + Tailwind** UI.  
It supports **projects**, **tasks** (assign at creation, drag & drop, delete), and **task comments**.

---

## 🚀 Tech Stack

**Backend**
- **Django 4.x** — web framework
- **Django REST Framework** — REST helpers (not primary API; used for future extensibility)
- **GraphQL (Graphene)** — primary API layer
- **PostgreSQL** — relational DB (Docker or local)

**Frontend**
- **React 18+**
- **TypeScript**
- **Apollo Client** — GraphQL client + normalized cache & optimistic updates
- **TailwindCSS** — styling (Tailwind v4)
- **@hello-pangea/dnd** — drag & drop

**Database**
- **PostgreSQL** (Docker/local setup)

---

## 📖 Features

- **Multi‑tenant isolation** via the `X-Org-Slug` header (e.g., `acme`, `globex`)
- **Projects**: create/list/update; dashboard shows task counts & completion
- **Tasks**: create (with assignee email), drag across columns, reorder within a column (sticky in‑session), delete
- **Comments**: per‑task comments with `authorEmail`, `content`, `createdAt`
- **Polished UI**: Tailwind v4, responsive, subtle animations

---

## 🗂️ Repository Layout

```
mini-pm/
├─ backend/                 # Django + Graphene server
│  ├─ manage.py
│  ├─ requirements.txt
│  ├─ projects/             # app: models, schema, resolvers, middleware
│  └─ config/               # settings, urls, ASGI/WSGI
└─ frontend/                # React + Vite + TypeScript + Apollo + Tailwind
   ├─ index.html
   ├─ src/
   │  ├─ apollo/            # client setup incl. header link
   │  ├─ components/        # UI components
   │  ├─ pages/             # routes
   │  └─ styles/
   └─ package.json
```

---

## 🧭 Quick Start

### 1) Backend (Django + GraphQL)

```bash
# clone
git clone https://github.com/YOUR_USERNAME/mini-pm.git
cd mini-pm/backend

# venv
python -m venv .venv
# macOS/Linux:
source .venv/bin/activate
# Windows (PowerShell):
# .\.venv\Scripts\Activate.ps1

# deps
pip install -r requirements.txt

# (optional) DB env; defaults in settings point to local Postgres
# export PGDATABASE=pmdb PGUSER=pmuser PGPASSWORD=pmpass PGHOST=127.0.0.1 PGPORT=5432

# migrate
python manage.py migrate

# (optional) seed via Django shell
python manage.py shell
# paste:
# from projects.models import Organization, Project, Task
# acme = Organization.objects.create(name="Acme Inc", slug="acme", contact_email="ops@acme.com")
# globex = Organization.objects.create(name="Globex", slug="globex", contact_email="it@globex.com")
# p = Project.objects.create(organization=acme, name="Website Revamp", status="ACTIVE")
# Task.objects.create(project=p, title="Landing page", status="IN_PROGRESS", assignee_email="dev@acme.com")
# Task.objects.create(project=p, title="Auth flow", status="TODO", assignee_email="be@acme.com")
# exit()

# run
python manage.py runserver
```

**GraphQL** UI: <http://localhost:8000/graphql/> (**⚠️ requires trailing slash**)  
In GraphiQL, set headers: `{ "X-Org-Slug": "acme" }`

**Postgres via Docker (optional):**

```bash
docker run --name mini-pm-db -e POSTGRES_DB=pmdb \
  -e POSTGRES_USER=pmuser -e POSTGRES_PASSWORD=pmpass \
  -p 5432:5432 -d postgres:15
```

> **Tip:** For dev, ensure CORS allows `http://localhost:5173`. In Django settings, add it or use `django-cors-headers`.

---

### 2) Frontend (React + Vite)

```bash
cd ../frontend
npm install
npm run dev
# open http://localhost:5173
```

The frontend adds `X-Org-Slug` automatically from `localStorage.orgSlug` (default `acme`). Use the **Org Picker** in the top bar to switch tenants.

**Minimal Apollo Link (example):**
```ts
// src/apollo/client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({ uri: "http://localhost:8000/graphql/" });

const orgLink = setContext((_, { headers }) => {
  const orgSlug = localStorage.getItem("orgSlug") || "acme";
  return { headers: { ...headers, "X-Org-Slug": orgSlug } };
});

export const client = new ApolloClient({
  link: orgLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

**Tailwind v4 quick hints:**
- Ensure PostCSS includes Tailwind: `postcss.config.cjs` → `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }`
- Import base styles in your global CSS: `@import "tailwindcss";`

---

## 📚 Usage Tutorial (5 minutes)

1. Open `http://localhost:5173/`
2. In the header **Org Picker**, choose `acme` or `globex`
3. **Create Project** → “+ New”, fill fields → **Create**
4. Open the project → **Task Board** (columns: **TODO** / **IN_PROGRESS** / **DONE**)
5. **Add Task** → title (+ optional assignee email) → **Add**
6. **Drag & Drop** tasks between columns (**status persists**) or reorder **within a column** (UI remembers order for the session)
7. Click **Comments** on a card → post comment (email + text)
8. Click **Delete** on a card → task disappears (and persists on refresh)

---

## 🔌 API Documentation (GraphQL)

### Headers
All requests must include the tenant header:

```json
{ "X-Org-Slug": "acme" }
```

### Queries

**List projects (with stats)**
```graphql
query {
  projects {
    id
    name
    description
    status
    dueDate
    taskCount
    completedTasks
  }
}
```

**List tasks by project**
```graphql
query($projectId: ID!) {
  tasks(projectId: $projectId) {
    id
    title
    description
    status
    assigneeEmail
    dueDate
    comments {
      id
      content
      authorEmail
      createdAt
    }
  }
}
```

### Mutations

**Create project**
```graphql
mutation($name: String!, $description: String, $status: String, $dueDate: Date) {
  createProject(name: $name, description: $description, status: $status, due_date: $dueDate) {
    project { id name description status dueDate taskCount completedTasks }
  }
}
```

**Update project**
```graphql
mutation($id: ID!, $name: String, $description: String, $status: String, $dueDate: Date) {
  updateProject(id: $id, name: $name, description: $description, status: $status, due_date: $dueDate) {
    project { id name description status dueDate taskCount completedTasks }
  }
}
```

**Create task (assign at creation)**
```graphql
mutation(
  $projectId: ID!
  $title: String!
  $description: String
  $status: String
  $assigneeEmail: String
  $dueDate: DateTime
) {
  createTask(
    projectId: $projectId
    title: $title
    description: $description
    status: $status
    assignee_email: $assigneeEmail
    due_date: $dueDate
  ) {
    task {
      id title status assigneeEmail dueDate
      comments { id content authorEmail createdAt }
    }
  }
}
```

**Update task (e.g., move status)**
```graphql
mutation($id: ID!, $status: String) {
  updateTask(id: $id, status: $status) {
    task { id status }
  }
}
```

**Delete task**
```graphql
mutation($id: ID!) {
  deleteTask(id: $id) { ok deletedId }
}
```

**Add task comment**
```graphql
mutation($taskId: ID!, $content: String!, $authorEmail: String!) {
  addTaskComment(task_id: $taskId, content: $content, author_email: $authorEmail) {
    taskComment { id content authorEmail createdAt }
  }
}
```

---

## 🧩 GraphQL Schema (SDL)

```graphql
scalar Date
scalar DateTime

type OrganizationType {
  id: ID!
  name: String!
  slug: String!
  contactEmail: String!
  createdAt: DateTime!
}

type TaskCommentType {
  id: ID!
  content: String!
  authorEmail: String!
  createdAt: DateTime!
}

type TaskType {
  id: ID!
  title: String!
  description: String
  status: String!
  assigneeEmail: String
  dueDate: DateTime
  createdAt: DateTime!
  comments: [TaskCommentType!]!
}

type ProjectType {
  id: ID!
  name: String!
  description: String
  status: String!
  dueDate: Date
  createdAt: DateTime!
  taskCount: Int!
  completedTasks: Int!
}

type Query {
  projects: [ProjectType!]!
  tasks(projectId: ID!): [TaskType!]!
}

type CreateProject {
  project: ProjectType!
}

type UpdateProject {
  project: ProjectType!
}

type CreateTask {
  task: TaskType!
}

type UpdateTask {
  task: TaskType!
}

type DeleteTask {
  ok: Boolean!
  deletedId: ID
}

type AddTaskComment {
  taskComment: TaskCommentType!
}

type Mutation {
  createProject(name: String!, description: String, status: String, due_date: Date): CreateProject!
  updateProject(id: ID!, name: String, description: String, status: String, due_date: Date): UpdateProject!

  createTask(
    projectId: ID!,
    title: String!,
    description: String,
    status: String,
    assignee_email: String,
    due_date: DateTime
  ): CreateTask!

  updateTask(
    id: ID!,
    title: String,
    description: String,
    status: String,
    assignee_email: String,
    due_date: DateTime
  ): UpdateTask!

  deleteTask(id: ID!): DeleteTask!

  addTaskComment(task_id: ID!, content: String!, author_email: String!): AddTaskComment!
}
```

---

## 🏗️ Architecture (ASCII)

```
+------------------+          GraphQL over HTTP           +------------------------+
|  React (Vite)    |  <---------------------------------> |  Django + Graphene     |
|  TypeScript      |                                       |  (projects app)        |
|  Apollo Client   |  X-Org-Slug header                    |  Org middleware        |
+--------+---------+                                       +-----------+------------+
         |                                                             |
         |                                                             v
         |                                                   +------------------+
         |                                                   |  PostgreSQL      |
         |                                                   |  (projects/tasks |
         |                                                   |   /comments/orgs)|
         |                                                   +------------------+
         |
         +-- UI: TailwindCSS, DnD (@hello-pangea/dnd)
```

**Multi‑tenancy:** A middleware reads `X-Org-Slug` and sets `request.organization`. Resolvers always **filter by that org**.

---

## 🧠 Technical Summary

### Decisions Made
- **GraphQL (Graphene)** over REST to let the UI fetch exactly what it needs, support optimistic updates, and leverage Apollo cache normalization.
- **Drag & drop** via `@hello-pangea/dnd` for smooth UX and maintained API.
- **Assign‑once policy** for `assigneeEmail` to maintain accountability history (no inline edits after creation).
- **Local UI order state** for within‑column reordering (fast UX); cross‑column moves persist **status** server‑side.

### Trade‑offs
- GraphQL adds schema/mutation boilerplate vs. a minimal REST‑only API.
- UI keeps within‑column order only during the **session** (not persisted) to avoid extra schema complexity; can be added with a `position` field later.
- Using a custom header for multi‑tenancy simplifies the demo but requires care in prod (auth + org membership checks).

### Future Improvements
- **Persisted ordering:** add `position: Int` to `Task`, sort by it, and expose an `updateTaskOrder` mutation (batch).
- **Auth & roles:** logins, per‑org membership, RBAC.
- **Subscriptions:** live updates via WebSockets (e.g., Channels + GraphQL subscriptions).
- **Attachments & rich text** for comments, mentions, and notifications.
- **Audit log** for task changes.

---

## 🧪 Troubleshooting

- **/graphql 404 or POST redirect** → use trailing slash: `http://localhost:8000/graphql/`.
- **ALLOWED_HOSTS error** → set `DEBUG=True` in dev or add host to `ALLOWED_HOSTS`.
- **CORS errors** → allow `http://localhost:5173` or use `django-cors-headers`.
- **Tailwind errors** → ensure PostCSS config and `@import "tailwindcss";` in global CSS; restart Vite.
- **White screen** → check browser console; fix TypeScript errors (e.g., type‑only imports: `import type { DropResult } ...`).

---

## 📜 License

**MIT** — do whatever you want, just keep the copyright notice.
