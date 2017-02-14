"""
Views that render the page
"""
from django.http import HttpResponse


def index(request):
    return HttpResponse("Watch this space for Jogging app")
