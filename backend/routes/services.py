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

        try:
            response = requests.get(url, params=params, headers=headers, timeout=5)
            data = response.json()
        except Exception as e:
            return None

        if not data:
            return None

        return float(data[0]["lat"]), float(data[0]["lon"])

    # ----------------------------
    # 2. Get real route from OSRM
    # ----------------------------
    def get_route(self, coordinates):
        # coordinates is a list of tuples: [(lat, lon), (lat, lon), ...]
        coord_string = ";".join([f"{lon},{lat}" for lat, lon in coordinates])
        url = f"http://router.project-osrm.org/route/v1/driving/{coord_string}"
        params = {
            "overview": "full",
            "geometries": "geojson"
        }
        try:
            response = requests.get(url, params=params, timeout=5)
            data = response.json()
        except Exception:
            return None
        
        if "routes" not in data or not data["routes"]:
            return None
            
        route = data["routes"][0]
        # OSRM GeoJSON is [lon, lat], but Leaflet Polyline expects [lat, lon]
        path = [[coord[1], coord[0]] for coord in route["geometry"]["coordinates"]]
        
        return {
            "distance_km": route["distance"] / 1000,
            "duration_hours": route["duration"] / 3600,
            "path": path
        }

    # ----------------------------
    # 3. Main function
    # ----------------------------
    def plan_route(self, current, pickup, dropoff):

        curr = self.get_coordinates(current)
        pick = self.get_coordinates(pickup)
        drop = self.get_coordinates(dropoff)

        if not curr or not pick or not drop:
            return {
                "error": "One or more locations are invalid"
            }

        route = self.get_route([curr, pick, drop])

        if not route:
            return {
                "error": "No route found between these locations"
            }

        return {
            "distance_km": round(route["distance_km"], 2),
            "estimated_hours": round(route["duration_hours"], 2),
            "path": route["path"],
            "waypoints": {
                "current": curr,
                "pickup": pick,
                "dropoff": drop
            }
        }