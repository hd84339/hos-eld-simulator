import requests
import json

def get_route():
    url = "http://router.project-osrm.org/route/v1/driving/-74.0060,40.7128;-87.6298,41.8781"
    params = {
        "overview": "full",
        "geometries": "geojson"
    }
    try:
        response = requests.get(url, params=params, timeout=5)
        print(f"OSRM Status: {response.status_code}")
        data = response.json()
        print(f"OSRM routes in data: {'routes' in data}")
        if 'routes' in data and len(data['routes']) > 0:
            print(f"OSRM distance: {data['routes'][0]['distance']}")
    except Exception as e:
        print(f"Error: {e}")

get_route()
