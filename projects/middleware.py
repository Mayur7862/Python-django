from django.core.exceptions import PermissionDenied
from .models import Organization

class OrganizationFromHeaderMiddleware:
    """
    Reads 'X-Org-Slug' header and sets request.organization.
    If provided slug is invalid, reject the request.
    """
    def __init__(self, get_response): self.get_response = get_response

    def __call__(self, request):
        slug = request.headers.get("X-Org-Slug")
        if slug:
            try:
                request.organization = Organization.objects.get(slug=slug)
            except Organization.DoesNotExist:
                raise PermissionDenied("Invalid organization.")
        else:
            request.organization = None
        return self.get_response(request)
