import { useQuery } from "@tanstack/react-query";
import { dashboardEndpoints } from "../endpoints/dashboard";

export const useDashboardPrAnalysisQuery = ({
    isEnabled,
    from,
    to,
    repo,
    breakdown,
}: {
    isEnabled?: boolean;
    from?: string;
    to?: string;
    repo?: string | null;
    breakdown?: string | null;
}) => {
    return useQuery({
        queryKey: ["dashboardPrAnalysis", { from, to, repo, breakdown }],
        queryFn: () =>
            dashboardEndpoints.getPrAnalysis({ from, to, repo, breakdown }),
        enabled: isEnabled,
    });
};

export const useDashboardIssueAnalysisQuery = ({
    isEnabled,
    from,
    to,
    repo,
    breakdown,
}: {
    isEnabled?: boolean;
    from?: string;
    to?: string;
    repo?: string | null;
    breakdown?: string | null;
}) => {
    return useQuery({
        queryKey: ["dashboardIssueAnalysis", { from, to, repo, breakdown }],
        queryFn: () =>
            dashboardEndpoints.getIssueAnalysis({ from, to, repo, breakdown }),
        enabled: isEnabled,
    });
};

export const useDashboardTimeMoneySavedQuery = ({
    isEnabled,
    from,
    to,
    repo,
    breakdown,
}: {
    isEnabled?: boolean;
    from?: string;
    to?: string;
    repo?: string | null;
    breakdown?: string | null;
}) => {
    return useQuery({
        queryKey: ["dashboardTimeMoneySaved", { from, to, repo, breakdown }],
        queryFn: () =>
            dashboardEndpoints.getTimeMoneySaved({ from, to, repo, breakdown }),
        enabled: isEnabled,
    });
};

export const useDashboardIssuesQuery = ({
    isEnabled,
    page,
    limit,
    from,
    to,
    repo,
    prUser,
    prState,
    severity,
    pullRequest,
}: {
    isEnabled?: boolean;
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
    return useQuery({
        queryKey: [
            "dashboardIssues",
            { from, to, repo, prUser, prState, severity, page, limit, pullRequest },
        ],
        queryFn: () =>
            dashboardEndpoints.getIssues({
                from,
                to,
                repo,
                prUser,
                prState,
                severity,
                page,
                limit,
                pullRequest
            }),
        enabled: isEnabled,
    });
};
