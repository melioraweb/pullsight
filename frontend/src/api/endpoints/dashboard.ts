import apiClient from "@/lib/axios";

export const dashboardEndpoints = {
    getPrAnalysis: ({
        from,
        to,
        repo,
        breakdown,
    }: {
        from?: string;
        to?: string;
        repo?: string | null;
        breakdown?: string | null;
    }) => {
        return apiClient
            .get("/api/dashboard/pr-analysis-card", {
                params: { from, to, repo, breakdown },
            })
            .then((res) => res.data);
    },

    getIssueAnalysis: ({
        from,
        to,
        repo,
        breakdown,
    }: {
        from?: string;
        to?: string;
        repo?: string | null;
        breakdown?: string | null;
    }) => {
        return apiClient
            .get("/api/dashboard/issue-analysis-card", {
                params: { from, to, repo, breakdown },
            })
            .then((res) => res.data);
    },
    getTimeMoneySaved: ({
        from,
        to,
        repo,
        breakdown,
    }: {
        from?: string;
        to?: string;
        repo?: string | null;
        breakdown?: string | null;
    }) => {
        return apiClient
            .get("/api/dashboard/time-money-save-card", {
                params: { from, to, repo, breakdown },
            })
            .then((res) => res.data);
    },
    getIssues: ({
        page = 1,
        limit = 10,
        from,
        to,
        repo,
        prUser,
        prState,
        severity,
        pullRequest
    }: {
        page?: number;
        limit?: number;
        from?: string;
        to?: string;
        repo?: string | null;
        prUser?: string | null;
        prState?: string | null;
        severity?: string | null;
        pullRequest?: string | null;
    }) => {
        return apiClient
            .get("/api/dashboard/issue-card", {
                params: {
                    from,
                    to,
                    repo,
                    prUser,
                    prState,
                    severity,
                    page,
                    limit,
                    pullRequest
                },
            })
            .then((res) => res.data);
    },
};
