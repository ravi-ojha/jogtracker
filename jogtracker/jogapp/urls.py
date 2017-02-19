"""
URLs for jogapp
"""
from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^get-user-info/$', views.get_user_info, name='get_user_info'),
    url(r'^get-user-list/$', views.get_user_list, name='get_user_list'),
    url(r'^jog/$', views.JogView.as_view(), name='create_jog'),
    url(r'^jog/(?P<pk>[0-9]+)/$', views.JogView.as_view(), name='single_jog'),
    url(r'^user-jogs/$', views.UserJogs.as_view(), name='all_user_jogs'),
    url(r'^user-jogs/(?P<user_id>[0-9]+)/$', views.UserJogs.as_view(), name='user_jogs'),
]

urlpatterns = format_suffix_patterns(urlpatterns)
