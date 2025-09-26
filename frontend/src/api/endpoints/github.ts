import apiClient from "@/lib/axios";
import { Organization } from "@/types/organization";
import { Repository } from "@/types/repository";
import { ApiResponse, PaginatedResponse } from "@/types/response";
import { User } from "@/types/user";

export const githubEndpoints = {
    getOrgs: async (): Promise<ApiResponse<Organization[]>> => {
        return apiClient.get("/github/organizations").then((res) => res.data);
    },
    getRepos: async ({
        filter,
    }: {
        filter?: string;
    }): Promise<ApiResponse<Repository[]>> => {
        return apiClient
            .get("/github/org-repos", {
                params: { filter },
            })
            .then((res) => res.data);
    },
    getOtherRepos: async ({
        page = 1,
        limit = 10,
    }): Promise<PaginatedResponse<Repository>> => {
        return apiClient
            .get("/github/user-repos", {
                params: { page, limit },
            })
            .then((res) => res.data);
    },
    getPRs: async (id: string) => {
        return apiClient
            .get(`/github/repos-pr-list`, {
                params: { repo: id },
            })
            .then((res) => res.data);
    },
    reviewPr: async ({
        prId,
        repoId,
    }: {
        prId: string;
        repoId: string;
    }): Promise<ApiResponse<void>> => {
        return apiClient
            .get(`/github/review-pr`, {
                params: { prNumber: prId, repo: repoId },
            })
            .then((res) => res.data);
    },

    getTeamMembers: async (): Promise<ApiResponse<User[]>> => {
        return apiClient.get(`/github/org-members`).then((res) => res.data);
    },
};
