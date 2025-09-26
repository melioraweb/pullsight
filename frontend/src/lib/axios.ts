// src/lib/axios.ts
import { getBaseUrl } from "@/lib/utils";
import axios from "axios";

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true, // for cookie-based auth
});

export default apiClient;
