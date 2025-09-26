import apiClient from "@/lib/axios";
import { Organization } from "@/types/organization";
import { Repository } from "@/types/repository";
import { ApiResponse, PaginatedResponse } from "@/types/response";
import { User } from "@/types/user";

export const bitbucketEndpoints = {
    getOrgs: async (): Promise<ApiResponse<Organization[]>> => {
        return apiClient
            .get("/bitbucket/organizations")
            .then((res) => res.data);
    },

    addOrg: async ({ slug, type }: { slug: string; type?: string }) => {
        return apiClient
            .post("/bitbucket/add-workspace", { slug, type })
            .then((res) => res.data);
    },

    getRepos: async ({
        filter,
    }: {
        filter: string;
    }): Promise<ApiResponse<Repository[]>> => {
        return apiClient
            .get("/bitbucket/org-repos", {
                params: { filter },
            })
            .then((res) => res.data);
    },
    getOtherRepos: async ({
        page = 1,
        limit = 10,
    }): Promise<PaginatedResponse<Repository>> => {
        return apiClient
            .get("/bitbucket/user-repos", {
                params: { page, limit },
            })
            .then((res) => res.data);
    },

    getPRs: async (id: string) => {
        return apiClient
            .get(`/bitbucket/repos-pr-list`, {
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
            .get(`/bitbucket/review-pr`, {
                params: { prNumber: prId, repo: repoId },
            })
            .then((res) => res.data);
    },
    getTeamMembers: async (): Promise<ApiResponse<User[]>> => {
        return apiClient.get(`/bitbucket/org-members`).then((res) => res.data);
    },
};
