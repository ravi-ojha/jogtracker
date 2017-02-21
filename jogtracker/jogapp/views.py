"""
Views that render the page
"""
import datetime
import pytz

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
    def get_all_user_jogs(self, from_date=None, to_date=None):
        if from_date:
            return Jog.objects.filter(
                timestamp__gte=from_date,
                timestamp__lte=to_date).select_related('user').order_by('-timestamp')
        return Jog.objects.all().select_related('user').order_by('-timestamp')

    def get_user_jogs(self, user_id, from_date=None, to_date=None):
        if from_date:
            return Jog.objects.filter(
                user_id=user_id,
                timestamp__gte=from_date,
                timestamp__lte=to_date).select_related('user').order_by('-timestamp')
        return Jog.objects.filter(user_id=user_id).select_related('user').order_by('-timestamp')

    def get(self, request, user_id=None, format=None):
        """
        Returns a dict

        If jogs were found then returns a dict like this
        {
          "overall_average_speed": 74,
          "total_time_taken": "2:00:00",
          "total_distance": 148,
          "jogs_list": [
            {
              "user_id": 2,
              "timestamp": "Feb 18, 2017",
              "duration": 1800,
              "distance": 88000,
              "jog_id": 41,
              "username": "goku",
              "duration_hrs": "0:30:00",
              "distance_kms": "88.0 km",
              "average_speed": "176.0 kmph"
            },
            .
            .
            .
          ]
        }
        Else returns empty dict
        {}

        """
        if user_id:
            jogs = self.get_user_jogs(user_id)
        else:
            jogs = self.get_all_user_jogs()

        total_distance = 0.0
        total_time_taken = 0.0
        overall_average_speed = 0.0
        jogs_list = []
        return_data = {}
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
            total_distance += data['distance']
            total_time_taken += data['duration']
            jogs_list.append(data)

        if jogs_list:
            total_distance = total_distance/float(1000)
            overall_average_speed = total_distance/(total_time_taken/float(3600))
            total_time_taken = str(datetime.timedelta(seconds=total_time_taken))
            return_data['totalDistance'] = '%.1f km' % total_distance
            return_data['overallAverageSpeed'] = '%.1f kmph' % overall_average_speed
            return_data['totalTimeTaken'] = total_time_taken
            return_data['jogList'] = jogs_list
        return Response(return_data)


    def post(self, request, user_id=None, format=None):
        """
        Returns a filter jog list as a dict

        If jogs were found then returns a dict like this
        {
          "overall_average_speed": 74,
          "total_time_taken": "2:00:00",
          "total_distance": 148,
          "jogs_list": [
            {
              "user_id": 2,
              "timestamp": "Feb 18, 2017",
              "duration": 1800,
              "distance": 88000,
              "jog_id": 41,
              "username": "goku",
              "duration_hrs": "0:30:00",
              "distance_kms": "88.0 km",
              "average_speed": "176.0 kmph"
            },
            .
            .
            .
          ]
        }
        Else returns empty dict
        {}

        """
        from_date = request.POST.get('from_date')
        to_date = request.POST.get('to_date')
        from_date = datetime.datetime.strptime(from_date, '%Y-%m-%d')
        to_date = datetime.datetime.strptime(to_date, '%Y-%m-%d')
        from_date = pytz.timezone('UTC').localize(from_date)
        to_date = pytz.timezone('UTC').localize(to_date)

        print from_date, to_date, "-"*20

        if user_id:
            jogs = self.get_user_jogs(user_id, from_date=from_date, to_date=to_date)
        else:
            jogs = self.get_all_user_jogs(from_date=from_date, to_date=to_date)

        total_distance = 0.0
        total_time_taken = 0.0
        overall_average_speed = 0.0
        jogs_list = []
        return_data = {}
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
            total_distance += data['distance']
            total_time_taken += data['duration']
            jogs_list.append(data)

        if jogs_list:
            total_distance = total_distance/float(1000)
            overall_average_speed = total_distance/(total_time_taken/float(3600))
            total_time_taken = str(datetime.timedelta(seconds=total_time_taken))
            return_data['totalDistance'] = '%.1f km' % total_distance
            return_data['overallAverageSpeed'] = '%.1f kmph' % overall_average_speed
            return_data['totalTimeTaken'] = total_time_taken
            return_data['jogList'] = jogs_list
        return Response(return_data)

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
    data['manageUsers'] = False
    data['manageApp'] = False
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
    Returns a dict of user_id mapped to user date

    {
        user_id_1: {
            'username': u.username,
            'email': u.email,
            'date_joined': u.date_joined
        }
        .
        .
        .
        user_id_n: {
            'username': u.username,
            'email': u.email,
            'date_joined': u.date_joined
        }
    }
    """
    users = User.objects.all()
    data = {}
    for u in users:
        data[u.id] = {
            'username': u.username,
            'email': u.email,
            'date_joined': u.date_joined
        }
    return JSONResponse(data)


@csrf_exempt
def delete_user(request, user_id):
    """
    Deletes the user object associated with user_id
    """
    data = {}
    user = User.objects.filter(id=user_id)
    if user:
        user.delete()
        data['success'] = True
        data['message'] = 'User was deleted successfully'
    else:
        data['success'] = False
        data['message'] = 'No such user exists'
    return JSONResponse(data)


@csrf_exempt
def update_user(request, user_id):
    """
    Updates the user object associated with user_id using the data in PUT request
    """
    username = request.POST.get('username')
    email = request.POST.get('email')

    data = {}
    user = User.objects.filter(id=user_id)
    if user:
        user.update(username=username, email=email)
        data['success'] = True
        data['message'] = 'User was updated successfully'
    else:
        data['success'] = False
        data['message'] = 'No such user exists'
    return JSONResponse(data)
