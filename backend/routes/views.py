from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .services import RouteEngine
from hos_engine.engine import HOSRulesEngine, HOSState
from hos_engine.eld.log_generator import ELDLogGenerator


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

    if "error" in route:
        return Response(
            {"error": route["error"]},
            status=status.HTTP_400_BAD_REQUEST
        )

    # -------------------------
    # 2. HOS ENGINE
    # -------------------------
    try:
        cycle_used = float(data["cycle_used"])
    except (ValueError, TypeError):
        return Response(
            {"error": "cycle_used must be a valid number"},
            status=status.HTTP_400_BAD_REQUEST
        )

    hos_engine = HOSRulesEngine()
    state = HOSState(cycle_used=cycle_used)

    # convert route time → driving hours
    driving_hours = route["estimated_hours"]

    hos_result = hos_engine.simulate_trip(state, driving_hours)

    eld = ELDLogGenerator()
    log = eld.generate_daily_log(
        driving_hours=hos_result["driving_hours"],
        on_duty_hours=hos_result["on_duty"]
    )

    # -------------------------
    # FINAL RESPONSE
    # -------------------------
    return Response({
        "route": route,
        "hos": hos_result,
        "eld_log": [
            {
                "status": entry.status,
                "start": entry.start,
                "end": entry.end
            } for entry in log
        ],
        "status": "trip_planned"
    })