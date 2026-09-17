import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api" || "http://localhost:8000/api",
  timeout: 15_000,
  headers: { Accept: "application/json" },
});
