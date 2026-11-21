from django.urls import path

from . import views

app_name = 'auditorium'

urlpatterns = [
    path('', views.experience, name='experience'),
]
