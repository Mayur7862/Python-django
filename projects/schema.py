# projects/schema.py
import graphene
from graphene_django import DjangoObjectType
from .models import Organization, Project, Task, TaskComment

# ---- Helpers ---------------------------------------------------------------

def require_org(info):
    """
    Pull the organization from request context (set by middleware).
    Raise if missing so all ops are org-scoped.
    """
    org = getattr(info.context, "organization", None)
    if not org:
        raise Exception("Organization context required (set header X-Org-Slug).")
    return org

# ---- Types -----------------------------------------------------------------

class ProjectType(DjangoObjectType):
    task_count = graphene.Int()
    completed_tasks = graphene.Int()

    class Meta:
        model = Project
        fields = (
            "id",
            "name",
            "description",
            "status",
            "due_date",
            "created_at",
        )

    def resolve_task_count(self, info):
        return self.tasks.count()

    def resolve_completed_tasks(self, info):
        return self.tasks.filter(status="DONE").count()


class TaskCommentType(DjangoObjectType):
    class Meta:
        model = TaskComment
        fields = ("id", "content", "author_email", "created_at", "task")


class TaskType(DjangoObjectType):
    # include comments field explicitly so clients can fetch it
    class Meta:
        model = Task
        fields = (
            "id",
            "title",
            "description",
            "status",
            "assignee_email",
            "due_date",
            "created_at",
            "project",
            "comments",   # <-- expose related comments
        )


class ProjectStats(graphene.ObjectType):
    total = graphene.Int()
    todo = graphene.Int()
    in_progress = graphene.Int()
    done = graphene.Int()
    completion_rate = graphene.Float()


# ---- Queries ---------------------------------------------------------------

class Query(graphene.ObjectType):
    projects = graphene.List(ProjectType)
    tasks = graphene.List(TaskType, project_id=graphene.ID(required=True))
    project_stats = graphene.Field(ProjectStats, project_id=graphene.ID(required=True))
    task_comments = graphene.List(TaskCommentType, task_id=graphene.ID(required=True))

    def resolve_projects(root, info):
        org = require_org(info)
        return Project.objects.filter(organization=org).order_by("-created_at")

    def resolve_tasks(root, info, project_id):
        org = require_org(info)
        return Task.objects.filter(
            project__organization=org, project_id=project_id
        ).order_by("-created_at")

    def resolve_project_stats(root, info, project_id):
        org = require_org(info)
        qs = Task.objects.filter(project__organization=org, project_id=project_id)
        total = qs.count()
        todo = qs.filter(status="TODO").count()
        ip = qs.filter(status="IN_PROGRESS").count()
        done = qs.filter(status="DONE").count()
        rate = (done / total * 100.0) if total else 0.0
        return ProjectStats(total=total, todo=todo, in_progress=ip, done=done, completion_rate=rate)

    def resolve_task_comments(root, info, task_id):
        org = require_org(info)
        return TaskComment.objects.filter(task__id=task_id, task__project__organization=org).order_by("created_at")


# ---- Mutations -------------------------------------------------------------

class CreateProject(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        due_date = graphene.Date()

    project = graphene.Field(ProjectType)

    @staticmethod
    def mutate(root, info, name, description="", status="ACTIVE", due_date=None):
        org = require_org(info)
        project = Project.objects.create(
            organization=org,
            name=name,
            description=description or "",
            status=status or "ACTIVE",
            due_date=due_date,
        )
        return CreateProject(project=project)


class UpdateProject(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()
        status = graphene.String()
        due_date = graphene.Date()

    project = graphene.Field(ProjectType)

    @staticmethod
    def mutate(root, info, id, **fields):
        org = require_org(info)
        project = Project.objects.get(id=id, organization=org)
        for k, v in fields.items():
            if v is not None:
                setattr(project, k, v)
        project.save()
        return UpdateProject(project=project)


class CreateTask(graphene.Mutation):
    class Arguments:
        project_id = graphene.ID(required=True)
        title = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        assignee_email = graphene.String()
        due_date = graphene.DateTime()

    task = graphene.Field(TaskType)

    @staticmethod
    def mutate(
        root,
        info,
        project_id,
        title,
        description="",
        status="TODO",
        assignee_email="",
        due_date=None,
    ):
        org = require_org(info)
        project = Project.objects.get(id=project_id, organization=org)
        task = Task.objects.create(
            project=project,
            title=title,
            description=description or "",
            status=status or "TODO",
            assignee_email=assignee_email or "",
            due_date=due_date,
        )
        return CreateTask(task=task)


class UpdateTask(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        title = graphene.String()
        description = graphene.String()
        status = graphene.String()
        assignee_email = graphene.String()
        due_date = graphene.DateTime()

    task = graphene.Field(TaskType)

    @staticmethod
    def mutate(root, info, id, **fields):
        org = require_org(info)
        task = Task.objects.get(id=id, project__organization=org)
        for k, v in fields.items():
            if v is not None:
                setattr(task, k, v)
        task.save()
        return UpdateTask(task=task)


class AddTaskComment(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
        content = graphene.String(required=True)
        author_email = graphene.String(required=True)

    comment = graphene.Field(TaskCommentType)

    @staticmethod
    def mutate(root, info, task_id, content, author_email):
        org = require_org(info)
        task = Task.objects.get(id=task_id, project__organization=org)
        c = TaskComment.objects.create(
            task=task, content=content, author_email=author_email
        )
        return AddTaskComment(comment=c)


class Mutation(graphene.ObjectType):
    create_project = CreateProject.Field()
    update_project = UpdateProject.Field()
    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    add_task_comment = AddTaskComment.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
