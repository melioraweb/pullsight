// src/api/auth/endpoints.ts
import apiClient from "@/lib/axios";
import { User } from "@/types/user";

export const authEndpoints = {
    getMe: async () => apiClient.get("/auth/profile").then((res) => res.data),
    getUserFromServer: async (cookie: string) =>
        apiClient
            .get("/auth/profile", { headers: { Cookie: cookie } })
            .then((res) => res.data),
    updateUser: async (data: unknown) =>
        apiClient.patch("/auth/update-profile", data).then((res) => res.data),
    logout: async () => apiClient.post("/auth/logout").then((res) => res.data),
};
