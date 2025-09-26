import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workspaceEndpoints } from "../endpoints/workspace";
import { useAuthStore } from "@/store/authStore";

export const useUpdateWorkspaceSettingsMutation = () => {
    const queryClient = useQueryClient();
    const { selectedWorkspace, setSelectedWorkspace } = useAuthStore();

    return useMutation({
        mutationFn: workspaceEndpoints.updateWorkspaceSettings,
        onSuccess: (data) => {
            if (selectedWorkspace && selectedWorkspace._id) {
                setSelectedWorkspace({
                    ...selectedWorkspace,
                    workspaceSetting: {
                        ...selectedWorkspace.workspaceSetting,
                        ...data?.data?.workspaceSetting,
                    },
                });
            }
            queryClient.invalidateQueries({ queryKey: ["workspace"] });
        },
    });
};

export const useMakeSubscriptionMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: workspaceEndpoints.createSubscription,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
};

export const useGetWorkspaceRepositoriesQuery = ({
    isActive = undefined,
    page = 1,
    limit = 10,
    author = null,
    isEnabled = true,
}: {
    isActive?: boolean;
    page?: number;
    limit?: number;
    author?: string | null;
    isEnabled?: boolean;
}) => {
    return useQuery({
        queryKey: ["repositories"],
        queryFn: ({}) =>
            workspaceEndpoints.getRepositories({
                isActive,
                page,
                limit,
                author,
            }),
        enabled: isEnabled,
    });
};

export const useUpdateRepositoryMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: workspaceEndpoints.updateRepository,
        onSuccess: () => {
            // Invalidate all queries that start with "repositories"
            queryClient.invalidateQueries({ queryKey: ["repositories"] });
            queryClient.refetchQueries({ queryKey: ["repositories"] });
        },
    });
};

export const useAddRepositoriesMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: workspaceEndpoints.addRepositories,
        onSuccess: () => {
            console.log(
                "Invalidating repositories queries after adding repositories"
            );
            // Try multiple invalidation approaches to ensure it works
            queryClient.invalidateQueries({ queryKey: ["repositories"] });
            queryClient.refetchQueries({ queryKey: ["repositories"] });
        },
    });
};

export const useGetWorkspacePullRequestsQuery = ({
    page = 1,
    limit = 10,
    repo = null,
    prState = null,
    prUser = null,
    isEnabled = true,
}: {
    page?: number;
    limit?: number;
    repo?: string | null;
    prState?: string | null;
    prUser?: string | null;
    isEnabled?: boolean;
}) => {
    return useQuery({
        queryKey: ["pullRequests", { page, limit, repo, prState, prUser }],
        queryFn: () =>
            workspaceEndpoints.getPullRequests({
                page,
                limit,
                repo: repo || undefined,
                prState: prState || undefined,
                prUser: prUser || undefined,
            }),
        enabled: isEnabled,
    });
};

export const useGetWorkspaceTeamMembersQuery = ({
    page = 1,
    limit = 10,
    isActive,
    isEnabled = true,
}: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    isEnabled?: boolean;
}) => {
    return useQuery({
        queryKey: ["teamMembers", { page, limit, isActive }],
        queryFn: () =>
            workspaceEndpoints.getTeamMembers({
                page,
                limit,
                isActive,
            }),
        enabled: isEnabled,
    });
};

export const useUpdateTeamMemberMutation = () => {
    const queryClient = useQueryClient();
    const { selectedWorkspace, setSelectedWorkspace } = useAuthStore();

    return useMutation({
        mutationFn: workspaceEndpoints.updateTeamMember,
        onSuccess: (_, variables: any) => {
            queryClient.invalidateQueries({
                queryKey: ["teamMembers"],
            });
            // update workspace noOfActiveMembers, if active then ++ else --. it's a number just.
            console.log("variables", variables);

            if (
                selectedWorkspace &&
                variables &&
                typeof variables === "object"
            ) {
                // sample variable above commented out
                const activeCount = variables?.members?.reduce(
                    (acc: any, member: any) => acc + (member.isActive ? 1 : 0),
                    0
                );
                const inactiveCount = variables?.members?.length - activeCount;

                const currentCount = selectedWorkspace.noOfActiveMembers || 0;
                const updatedWorkspace = {
                    ...selectedWorkspace,
                    noOfActiveMembers:
                        currentCount + (activeCount - inactiveCount),
                };
                setSelectedWorkspace(updatedWorkspace);
            }
        },
    });
};
