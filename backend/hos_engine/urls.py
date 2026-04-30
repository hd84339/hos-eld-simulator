from django.urls import path
from .views import simulate_trip

urlpatterns = [
    path('simulate-trip/', simulate_trip),
]