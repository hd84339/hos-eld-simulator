import requests


class RouteEngine:

    # ----------------------------
    # 1. Convert location → lat/lon
    # ----------------------------
    def get_coordinates(self, place):

        url = "https://nominatim.openstreetmap.org/search"

        params = {
            "q": place,
            "format": "json",
            "countrycodes": "us"
        }

        headers = {
            "User-Agent": "hos-eld-simulator-app/1.0 (test-deployment)"
        }

        try:
            response = requests.get(url, params=params, headers=headers, timeout=10)
            if response.status_code != 200:
                print(f"Nominatim Error {response.status_code}: {response.text}")
                return {"error": f"Geocoding service returned status {response.status_code}"}
                
            data = response.json()
        except requests.exceptions.Timeout:
            print(f"Nominatim Timeout for {place}")
            return {"error": f"Geocoding timed out while searching for '{place}'. Please try again."}
        except Exception as e:
            print(f"Nominatim Exception: {e}")
            return {"error": f"Geocoding error for '{place}'"}

        if not data:
            print(f"Nominatim No Data for {place}")
            return {"error": f"Could not find coordinates for location: '{place}'"}

        return float(data[0]["lat"]), float(data[0]["lon"])

    def reverse_geocode(self, lat, lon):
        url = "https://nominatim.openstreetmap.org/reverse"
        params = {
            "lat": lat,
            "lon": lon,
            "format": "json"
        }
        headers = {
            "User-Agent": "hos-eld-simulator-app/1.0 (test-deployment)"
        }
        try:
            response = requests.get(url, params=params, headers=headers, timeout=5)
            if response.status_code == 200:
                data = response.json()
                address = data.get("address", {})
                city = address.get("city") or address.get("town") or address.get("village") or address.get("hamlet") or address.get("county")
                state = address.get("state")
                if city and state:
                    return f"{city}, {state}"
                return address.get("display_name", "Unknown Location")
        except:
            pass
        return "Unknown Location"

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
            if response.status_code != 200:
                try:
                    error_data = response.json()
                    msg = error_data.get("message", response.text)
                except:
                    msg = response.text
                print(f"OSRM Error {response.status_code}: {msg} | Coordinates: {coord_string}")
                return {"error": f"OSRM Routing Error: {msg}"}
            data = response.json()
        except Exception as e:
            print(f"OSRM Exception: {e}")
            return {"error": f"OSRM Exception: {str(e)}"}
        
        if "routes" not in data or not data["routes"]:
            print(f"OSRM No routes found for {coordinates}")
            return {"error": "No routes found between these locations."}
            
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
        if isinstance(curr, dict) and "error" in curr: return curr

        pick = self.get_coordinates(pickup)
        if isinstance(pick, dict) and "error" in pick: return pick

        drop = self.get_coordinates(dropoff)
        if isinstance(drop, dict) and "error" in drop: return drop

        route = self.get_route([curr, pick, drop])

        if "error" in route:
            return route

        return {
            "distance_km": round(route["distance_km"], 2),
            "estimated_hours": round(route["duration_hours"], 2),
            "path": route["path"],
            "waypoints": {
                "current": curr,
                "pickup": pick,
                "dropoff": drop,
                "pickup_name": pickup,
                "dropoff_name": dropoff
            }
        }

    # ----------------------------
    # 4. Generate Geospatial Stops
    # ----------------------------
    def generate_stops(self, path, total_distance_km, raw_logs):
        import math

        def haversine(lat1, lon1, lat2, lon2):
            R = 6371.0 # Earth radius in kilometers
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            return R * c

        # Precompute segment distances and cumulative distance
        total_path_dist = 0
        cum_dists = [0]
        for i in range(1, len(path)):
            d = haversine(path[i-1][0], path[i-1][1], path[i][0], path[i][1])
            total_path_dist += d
            cum_dists.append(total_path_dist)

        def interpolate(fraction):
            if fraction <= 0: return path[0]
            if fraction >= 1: return path[-1]
            
            target_dist = fraction * total_path_dist
            for i in range(1, len(path)):
                if cum_dists[i] >= target_dist:
                    # interpolate between i-1 and i
                    segment_dist = cum_dists[i] - cum_dists[i-1]
                    if segment_dist == 0:
                        return path[i]
                    ratio = (target_dist - cum_dists[i-1]) / segment_dist
                    lat = path[i-1][0] + (path[i][0] - path[i-1][0]) * ratio
                    lon = path[i-1][1] + (path[i][1] - path[i-1][1]) * ratio
                    return [lat, lon]
            return path[-1]

        stops = []
        
        # 1. Fuel Stops (every 1000 miles ~ 1609 km)
        fuel_interval_km = 1609.34
        current_fuel_target = fuel_interval_km
        
        while current_fuel_target < total_distance_km:
            fraction = current_fuel_target / total_distance_km
            coord = interpolate(fraction)
            stops.append({
                "type": "fuel",
                "label": "Fuel Stop",
                "location": coord,
                "place_name": self.reverse_geocode(coord[0], coord[1])
            })
            current_fuel_target += fuel_interval_km
            
        # 2. Rest Stops (from raw_logs)
        # We need to map time to distance fraction.
        # Assuming constant speed: fraction = driving_time_so_far / total_driving_time
        total_driving_time = sum(l["end"] - l["start"] for l in raw_logs if l["status"] == "DRIVING")
        if total_driving_time == 0:
            return stops
            
        driving_time_so_far = 0
        for log in raw_logs:
            if log["status"] == "DRIVING":
                driving_time_so_far += (log["end"] - log["start"])
            elif log["status"] in ["OFF_DUTY", "SLEEPER"]:
                if log["end"] - log["start"] >= 0.5:
                    fraction = driving_time_so_far / total_driving_time
                    coord = interpolate(fraction)
                    label = "10 hr rest" if log["end"] - log["start"] >= 10 else "30 min break"
                    stops.append({
                        "type": "rest",
                        "label": label,
                        "location": coord,
                        "place_name": self.reverse_geocode(coord[0], coord[1])
                    })

        return stops