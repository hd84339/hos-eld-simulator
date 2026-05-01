import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/", // Use environment variable for production, localhost for local
});

export const planTrip = (data) => {
  return API.post("plan-trip/", data);
};
