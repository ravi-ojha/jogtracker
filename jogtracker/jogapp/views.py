"""
Views that render the page
"""
import datetime

from django.contrib.auth.models import User
from django.http import Http404
from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from jogapp.models import Jog
from jogapp.serializers import JogSerializer
from rest_framework import status
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import APIView


def index(request):
    """
    Home page
    """
    template = 'jogapp/index.html'
    return render(request, template, {})


class JSONResponse(HttpResponse):
    """
    An HttpResponse that renders its content into JSON.
    """
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)


class JogView(APIView):
    """
    Create, retrieve, update or delete a jog instance.
    """

    def get_or_404(self, pk):
        try:
            return Jog.objects.get(pk=pk)
        except Jog.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        """
        Returns a json dictionary for jog instance

        If jog instance is found then
        {
            "id": 1,
            "user_id": 1,
            "timestamp": "Feb 15, 2017",
            "duration": 600, # In seconds
            "distance": 1000, # In meters
            "duration_hrs": "0.17", # In hours
            "distance_kms": "1.00", # In kms
            "average_speed": "6.00" # kmph
        }
        Else
        {
            "detail": "Not found."
        }

        """
        jog = self.get_or_404(pk)
        serializer = JogSerializer(jog)
        data = serializer.data
        data['jog_id'] = jog.id
        data['duration_hrs'] = str(datetime.timedelta(seconds=data['duration']))
        data['distance_kms'] = data['distance']/float(1000)
        data['average_speed'] = data['distance_kms']/(data['duration']/float(3600))
        data['distance_kms'] = '%.1f km' % data['distance_kms']
        data['average_speed'] = '%.1f kmph' % data['average_speed']
        return Response(data)

    def post(self, request, format=None):
        print request.data, "@"*20
        serializer = JogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk, format=None):
        jog = self.get_or_404(pk)
        data = request.data
        print data, "#"*89
        serializer = JogSerializer(jog, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        jog = self.get_or_404(pk)
        jog.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserJogs(APIView):
    """
    Retrieve multiple instances of jogs for a user
    """
    def get_all_user_jogs(self):
        return Jog.objects.all().select_related('user').order_by('-timestamp')

    def get_user_jogs(self, user_id):
        return Jog.objects.filter(user_id=user_id).select_related('user').order_by('-timestamp')

    def get(self, request, user_id=None, format=None):
        """
        Returns a list

        If jog instances are found then
        [
            {
                "id": 1,
                "user_id": 1,
                "timestamp": "Feb 15, 2017",
                "duration": 600, # In seconds
                "distance": 1000, # In meters
                "duration_hrs": "0.17", # In hours
                "distance_kms": "1.00", # In kms
                "average_speed": "6.00" # kmph
            }
            .
            .
            .
        ]
        Else
        []

        """
        if user_id:
            jogs = self.get_user_jogs(user_id)
        else:
            jogs = self.get_all_user_jogs()
        jogs_list = []
        for jog in jogs:
            serializer = JogSerializer(jog)
            data = serializer.data
            data['jog_id'] = jog.id
            data['username'] = jog.user.username
            data['duration_hrs'] = str(datetime.timedelta(seconds=data['duration']))
            data['distance_kms'] = data['distance']/float(1000)
            data['average_speed'] = data['distance_kms']/(data['duration']/float(3600))
            data['distance_kms'] = '%.1f km' % data['distance_kms']
            data['average_speed'] = '%.1f kmph' % data['average_speed']
            jogs_list.append(data)
        return Response(jogs_list)

@csrf_exempt
def get_user_info(request):
    """
    Get the resources that this user has access to
    """
    user = request.user
    if not user.is_authenticated():
        data = {'authenticated': False}
        return JSONResponse(data)

    groups = user.groups.all()
    data = {}
    for group in groups:
        if group.id == 1:
            data['manageUsers'] = True
        if group.id == 2:
            data['manageUsers'] = True
            data['manageApp'] = True

    data['user_id'] = user.id
    data['username'] = user.username
    data['activeTab'] = 'myJogs'
    data['authenticated'] = True
    return JSONResponse(data)


@csrf_exempt
def get_user_list(request):
    """
    Get the list of usernames
    """
    users = User.objects.all()
    data = {}
    for u in users:
        data[u.id] = u.username
    return JSONResponse(data)
