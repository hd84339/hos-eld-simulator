from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .services import RouteEngine
from hos_engine.engine import HOSRulesEngine, HOSState


@api_view(['POST'])
def plan_trip(request):

    data = request.data

    # validation
    required_fields = ["current_location", "pickup_location", "dropoff_location", "cycle_used"]

    for field in required_fields:
        if field not in data:
            return Response(
                {"error": f"{field} is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

    # -------------------------
    # 1. ROUTE ENGINE
    # -------------------------
    route_engine = RouteEngine()

    route = route_engine.plan_route(
        data["pickup_location"],
        data["dropoff_location"]
    )

    # -------------------------
    # 2. HOS ENGINE
    # -------------------------
    hos_engine = HOSRulesEngine()
    state = HOSState(cycle_used=float(data["cycle_used"]))

    # convert route time → driving hours
    driving_hours = route["estimated_hours"]

    hos_result = hos_engine.simulate_trip(state, driving_hours)

    # -------------------------
    # FINAL RESPONSE
    # -------------------------
    return Response({
        "route": route,
        "hos": hos_result,
        "status": "trip_planned"
    })