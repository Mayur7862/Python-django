# core/urls.py
from django.contrib import admin
from django.urls import path
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from graphene_django.views import GraphQLView

def health(request):
    return HttpResponse("Mini-PM backend running. Try /graphql or /admin.", content_type="text/plain")

graphql_view = csrf_exempt(GraphQLView.as_view(graphiql=True))

urlpatterns = [
    path("", health),
    path("admin/", admin.site.urls),

    # Accept BOTH with and without trailing slash to avoid 404s from clients
    path("graphql/", graphql_view),
    path("graphql", graphql_view),
]
