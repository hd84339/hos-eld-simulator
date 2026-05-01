import axios from "axios";

const API = axios.create({
  baseURL: "https://hos-eld-simulator.onrender.com/api/",
});

export const planTrip = (data) => {
  return API.post("plan-trip/", data);
};
