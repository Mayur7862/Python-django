from django.http import HttpResponse

def health(request):
    return HttpResponse("Mini-PM backend is running. Try /graphql or /admin.", content_type="text/plain")
