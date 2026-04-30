from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .engine import HOSRulesEngine, HOSState


@api_view(['POST'])
def simulate_trip(request):

    data = request.data

    driving_hours = float(data.get("driving_hours", 0))
    cycle_used = float(data.get("cycle_used", 0))

    # Create engine + state
    engine = HOSRulesEngine()
    state = HOSState(cycle_used=cycle_used)

    result = engine.simulate_trip(state, driving_hours)

    return Response({
        "input": data,
        "result": result
    })