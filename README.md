# 🚚 HOS + ELD Simulator — Full-Stack Logistics App

A full-stack simulation system that models **FMCSA Hours of Service (HOS)** rules and **Electronic Logging Device (ELD)** behavior for long-haul trucking.

This project allows users to plan routes, simulate driving hours, and verify compliance in real-time using real-world map data.

---

## 🚀 Tech Stack

### Backend

* Python
* Django
* Django REST Framework
* OpenStreetMap (Nominatim API)
* OSRM (Open Source Routing Machine)

### Frontend

* React.js
* Axios
* React Leaflet (Maps)

---

## 📂 Project Structure

```
hos-eld-simulator/
├── backend/
│   ├── routes/              # External API integrations (OSRM, Nominatim)
│   ├── hos_engine/          # Core HOS + ELD logic
│   │   ├── engine.py        # FMCSA rule engine
│   │   └── eld/
│   │       └── log_generator.py
│   ├── views.py             # API endpoints
│   └── core/                # Django settings
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TripForm.js
│   │   │   ├── ELDDashboard.js
│   │   │   └── MapView.js
│   │   └── api/api.js
│
└── README.md
```

---

## ⚙️ Core Features

### 🚛 Route Planning

* Converts location names → GPS coordinates using Nominatim
* Calculates real-world driving routes using OSRM
* Returns:

  * Distance (km/miles)
  * Estimated travel time
  * Route path for map rendering

---

### 🧠 HOS Rule Engine

Implements real FMCSA compliance rules:

* 11-hour driving limit
* 14-hour duty window
* 70-hour cycle rule

The system simulates how a trip impacts driver limits and determines:

* ✅ Approved (compliant)
* 🚫 Violation (limit exceeded)

---

### 📄 ELD Log Simulation

* Automatically generates driver activity logs:

  * DRIVING
  * ON_DUTY
  * OFF_DUTY
* Time-based breakdown of activities
* Mimics real Electronic Logging Device behavior

Example:

```
DRIVING: 0 → 3.06 hrs
ON_DUTY: 3.06 → 5.06 hrs
```

---

### 🗺️ Map Visualization

* Interactive map using React Leaflet
* Displays:

  * Route polyline
  * Start & destination markers
* Uses OpenStreetMap tiles (free & open-source)

---

## 🔄 Data Flow

```
User Input (React Form)
        ↓
Axios API Request
        ↓
Django Backend
        ↓
Route Calculation (OSRM)
        ↓
HOS Engine Simulation
        ↓
ELD Log Generation
        ↓
JSON Response
        ↓
Frontend Dashboard + Map
```

---

## ▶️ Running the Project

### 1️⃣ Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # (Windows)

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

Open:

```
http://localhost:3000
```

---

## 🧪 Testing Scenarios

### ✅ Valid Trip (Compliant)

* Pickup: Philadelphia
* Dropoff: Washington DC
* Cycle Hours Used: 0

Result:
✔ Approved
✔ ELD logs generated

---

### 🚫 Violation Case

* Pickup: New York
* Dropoff: Los Angeles
* Cycle Hours Used: 0

Result:
❌ Driving limit exceeded
❌ HOS violation detected

---

## 📊 Example API Response

```json
{
  "route": {
    "distance_km": 137.1,
    "estimated_hours": 3.06
  },
  "hos": {
    "status": "approved",
    "driving_hours": 3.06,
    "on_duty": 5.06,
    "cycle_used": 5.06
  },
  "eld_log": [
    {
      "status": "DRIVING",
      "start": 0,
      "end": 3.06
    },
    {
      "status": "ON_DUTY",
      "start": 3.06,
      "end": 5.06
    }
  ]
}
```

---

## 💡 What This Project Demonstrates

* Real-world logistics simulation
* Rule-based system design (HOS engine)
* Backend API architecture (Django REST)
* Geospatial routing integration (OSRM)
* Frontend data visualization (React + Maps)

---

## 🚀 Future Improvements

* Multi-day ELD log generation
* Driver rest optimization system
* Real-time GPS tracking
* AI-based route optimization
* Fleet management dashboard

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Harsh Dubey

For queries or collaboration:
📧 [hd84339@gmail.com](mailto:hd84339@gmail.com)

---

**Happy Routing! 🚚💨**
