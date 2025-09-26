// src/api/auth/queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { authEndpoints } from "../endpoints/auth";

export const useUserQuery = ({ isEnabled = true }) => {
    const { setSelectedWorkspace, setWorkspaces, setUser } = useAuthStore(
        (s) => s
    );
    return useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const data = await authEndpoints.getMe();
            const user = data?.data;
            if (user) {
                setUser(user);
                setWorkspaces(user.workspaces);
                setSelectedWorkspace(user.currentWorkspace || null);
            }
            return user;
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
        enabled: isEnabled,
    });
};

export const useLogoutMutation = () => {
    const queryClient = useQueryClient();
    const clearStore = useAuthStore((s) => s.clearStore);

    return useMutation({
        mutationFn: authEndpoints.logout,
        onSuccess: () => {
            clearStore();
            queryClient.removeQueries({ queryKey: ["user"] });
        },
    });
};

export const useUpdateUserMutation = () => {
    const queryClient = useQueryClient();
    const {
        user,
        workspaces,
        setUser,
        setSelectedWorkspace,
        setMyRoleInSelectedWorkspace,
        setWorkspaces,
    } = useAuthStore();

    return useMutation({
        mutationFn: (variables: any) => {
            const { updateState = true, ...data } = variables;
            return authEndpoints.updateUser(data);
        },
        onSuccess: (data, variables: any) => {
            const { updateState = true } = variables;
            // Only update state if updateState is true (default behavior)
            if (updateState !== false) {
                setUser({ ...user, ...data?.data });
                setSelectedWorkspace(data?.data?.currentWorkspace || null);

                if (data?.data?.workspaces) {
                    setWorkspaces(data?.data?.workspaces);
                }

                // if current workspace is changed, update myRoleInSelectedWorkspace
                if (variables.currentWorkspace) {
                    const selectedWorkspace = workspaces?.find(
                        (ws) => ws._id === variables.currentWorkspace
                    );
                    setMyRoleInSelectedWorkspace(
                        user?._id == selectedWorkspace?.ownerId
                            ? "admin"
                            : "member"
                    );
                } else {
                    setMyRoleInSelectedWorkspace(null);
                }
            }
            queryClient.invalidateQueries({ queryKey: ["user", "repos"] });
        },
    });
};
