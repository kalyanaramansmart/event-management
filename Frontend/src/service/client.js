import axios from "axios";

const client = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = async (
  url,
  { method = "get", data = null, params = null } = {}
) => {
  const res = await client({
    url,
    method,
    data,
    params,
  });

  return res.data;
};
