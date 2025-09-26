import apiClient from "@/lib/axios";

export const workspaceEndpoints = {
    updateWorkspaceSettings: async (payload: unknown) => {
        return apiClient
            .patch("/workspace/update-settings", payload)
            .then((res) => res.data);
    },
    createSubscription: async (payload: unknown) =>
        apiClient
            .post("/workspace/subscription", payload)
            .then((res) => res.data),

    getRepositories: async ({
        page = 1,
        limit = 10,
        isActive,
        author = null,
    }: {
        page?: number;
        limit?: number;
        isActive?: boolean;
        author?: string | null;
    }) => {
        return apiClient
            .get("/workspace/repositories", {
                params: { isActive, page, limit, author },
            })
            .then((res) => res.data);
    },

    updateRepository: async (payload: { id: string; data: unknown }) => {
        return apiClient
            .patch(`/workspace/repositories/${payload.id}`, payload.data)
            .then((res) => res.data);
    },

    addRepositories: async (payload: unknown) => {
        return apiClient
            .post("/workspace/repositories", payload)
            .then((res) => res.data);
    },

    getPullRequests: async ({
        page = 1,
        limit = 10,
        repo = null,
        prState = null,
        prUser = null,
    }: {
        page?: number;
        limit?: number;
        repo?: string | null;
        prState?: string | null;
        prUser?: string | null;
    }) => {
        return apiClient
            .get("/workspace/pr-list", {
                params: { page, limit, repo, prState, prUser },
            })
            .then((res) => res.data);
    },
    getTeamMembers: async ({
        page = 1,
        limit = 10,
        isActive,
    }: {
        page?: number;
        limit?: number;
        isActive?: boolean;
    }) => {
        return apiClient
            .get("/workspace/team-members", {
                params: { page, limit, isActive },
            })
            .then((res) => res.data);
    },
    updateTeamMember: async (data: unknown) => {
        return apiClient
            .post(`/workspace/members/`, data)
            .then((res) => res.data);
    },
};
