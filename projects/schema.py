import graphene
from graphene_django import DjangoObjectType
from django.db.models import Count, Q
from .models import Organization, Project, Task, TaskComment

# --- Helpers ---

def get_org(info):
    org = getattr(info.context, "organization", None)
    if not org:
        raise Exception("Organization header missing: send X-Org-Slug")
    return org

# --- Types ---

class OrganizationType(DjangoObjectType):
    class Meta:
        model = Organization
        fields = ("id", "name", "slug", "contact_email", "created_at")

class TaskCommentType(DjangoObjectType):
    class Meta:
        model = TaskComment
        fields = ("id", "content", "author_email", "created_at")

class TaskType(DjangoObjectType):
    class Meta:
        model = Task
        # include reverse 'comments' via related_name
        fields = (
            "id",
            "title",
            "description",
            "status",
            "assignee_email",
            "due_date",
            "created_at",
            "comments",
        )

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
        return Task.objects.filter(project=self).count()

    def resolve_completed_tasks(self, info):
        return Task.objects.filter(project=self, status="DONE").count()

# --- Queries ---

class Query(graphene.ObjectType):
    projects = graphene.List(ProjectType)
    tasks = graphene.List(TaskType, project_id=graphene.ID(required=True))

    def resolve_projects(self, info):
        org = get_org(info)
        return Project.objects.filter(organization=org).order_by("-created_at")

    def resolve_tasks(self, info, project_id):
        org = get_org(info)
        return Task.objects.filter(
            project_id=project_id,
            project__organization=org,
        ).order_by("created_at")

# --- Mutations ---

class CreateProject(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String(required=False, default_value="ACTIVE")
        due_date = graphene.Date()

    project = graphene.Field(ProjectType)

    @staticmethod
    def mutate(root, info, name, description=None, status="ACTIVE", due_date=None):
        org = get_org(info)
        p = Project.objects.create(
            organization=org, name=name, description=description or "", status=status, due_date=due_date
        )
        return CreateProject(project=p)

class UpdateProject(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()
        status = graphene.String()
        due_date = graphene.Date()

    project = graphene.Field(ProjectType)

    @staticmethod
    def mutate(root, info, id, **kwargs):
        org = get_org(info)
        try:
            p = Project.objects.get(pk=id, organization=org)
        except Project.DoesNotExist:
            raise Exception("Project not found")
        for k, v in kwargs.items():
            if v is not None:
                setattr(p, k, v)
        p.save()
        return UpdateProject(project=p)

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
    def mutate(root, info, project_id, title, description=None, status="TODO", assignee_email=None, due_date=None):
        org = get_org(info)
        try:
            p = Project.objects.get(pk=project_id, organization=org)
        except Project.DoesNotExist:
            raise Exception("Project not found")
        t = Task.objects.create(
            project=p,
            title=title,
            description=description or "",
            status=status or "TODO",
            assignee_email=assignee_email or "",
            due_date=due_date,
        )
        return CreateTask(task=t)

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
    def mutate(root, info, id, **kwargs):
        org = get_org(info)
        try:
            t = Task.objects.get(pk=id, project__organization=org)
        except Task.DoesNotExist:
            raise Exception("Task not found")
        for k, v in kwargs.items():
            if v is not None:
                setattr(t, k, v)
        t.save()
        return UpdateTask(task=t)

class DeleteTask(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    ok = graphene.Boolean()
    deleted_id = graphene.ID()

    @staticmethod
    def mutate(root, info, id):
        org = get_org(info)
        try:
            t = Task.objects.get(pk=id, project__organization=org)
        except Task.DoesNotExist:
            raise Exception("Task not found")
        t.delete()
        return DeleteTask(ok=True, deleted_id=id)

class AddTaskComment(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
        content = graphene.String(required=True)
        author_email = graphene.String(required=True)

    task_comment = graphene.Field(TaskCommentType)

    @staticmethod
    def mutate(root, info, task_id, content, author_email):
        org = get_org(info)
        try:
            t = Task.objects.get(pk=task_id, project__organization=org)
        except Task.DoesNotExist:
            raise Exception("Task not found")
        c = TaskComment.objects.create(task=t, content=content, author_email=author_email)
        return AddTaskComment(task_comment=c)

class Mutation(graphene.ObjectType):
    create_project = CreateProject.Field()
    update_project = UpdateProject.Field()
    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    delete_task = DeleteTask.Field()
    add_task_comment = AddTaskComment.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)
