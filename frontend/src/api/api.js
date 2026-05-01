import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/"
});

export const planTrip = (data) => {
  return API.post("plan-trip/", data);
};
