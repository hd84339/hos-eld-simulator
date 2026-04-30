import requests


class RouteEngine:

    # ----------------------------
    # 1. Convert location → lat/lon
    # ----------------------------
    def get_coordinates(self, place):

        url = "https://nominatim.openstreetmap.org/search"

        params = {
            "q": place,
            "format": "json"
        }

        headers = {
            "User-Agent": "hos-eld-simulator"
        }

        response = requests.get(url, params=params, headers=headers)
        data = response.json()

        if not data:
            return None

        return float(data[0]["lat"]), float(data[0]["lon"])

    # ----------------------------
    # 2. Get real route from OSRM
    # ----------------------------
    def get_route(self, start_lat, start_lon, end_lat, end_lon):

        url = f"http://router.project-osrm.org/route/v1/driving/{start_lon},{start_lat};{end_lon},{end_lat}"

        params = {
            "overview": "false"
        }

        response = requests.get(url, params=params)
        data = response.json()

        route = data["routes"][0]

        return {
            "distance_km": route["distance"] / 1000,
            "duration_hours": route["duration"] / 3600
        }

    # ----------------------------
    # 3. Main function
    # ----------------------------
    def plan_route(self, pickup, dropoff):

        start = self.get_coordinates(pickup)
        end = self.get_coordinates(dropoff)

        if not start or not end:
            return {
                "error": "Invalid location"
            }

        route = self.get_route(
            start[0], start[1],
            end[0], end[1]
        )

        return {
            "distance_km": round(route["distance_km"], 2),
            "estimated_hours": round(route["duration_hours"], 2),
            "stops": self.generate_stops(route["distance_km"])
        }

    # ----------------------------
    # 4. Stops logic (unchanged)
    # ----------------------------
    def generate_stops(self, distance_km):

        stops = []

        if distance_km > 1600:
            stops.append({
                "type": "fuel",
                "after_km": 1600,
                "duration_min": 20
            })

        stops.append({
            "type": "rest",
            "after_hours": 8,
            "duration_min": 30
        })

        return stops