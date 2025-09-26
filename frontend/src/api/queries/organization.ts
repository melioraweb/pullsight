import { useMutation, useQuery } from "@tanstack/react-query";
import { githubEndpoints } from "../endpoints/github";
import { ApiResponse } from "@/types/response";
import { Organization } from "@/types/organization";
import { Provider } from "@/types/user";
import { bitbucketEndpoints } from "../endpoints/bitbucket";
import { useAuthStore } from "@/store/authStore";

export const useOrganizationQuery = ({
    provider = "github",
    isEnabled = true,
}: {
    provider?: Provider;
    isEnabled?: boolean;
}) => {
    const queryFnMap: Record<
        Provider,
        () => Promise<ApiResponse<Organization[]>>
    > = {
        github: githubEndpoints.getOrgs,
        bitbucket: bitbucketEndpoints.getOrgs, // Uncomment and implement if needed
    };

    const queryFn = queryFnMap[provider];
    if (!queryFn) {
        throw new Error(`Unsupported provider: ${provider}`);
    }

    return useQuery<Organization[], Error>({
        queryKey: [provider, "orgs"],
        queryFn: async () => {
            const response = await queryFn();
            if (!response?.data) {
                throw new Error("No data received from response");
            }
            return response.data;
        },
        enabled: isEnabled,
    });
};

export const useOrganizationAddMutation = ({
    provider = "bitbucket",
}: {
    provider?: "bitbucket";
}) => {
    const { user, setUser, setSelectedWorkspace, workspaces, setWorkspaces } =
        useAuthStore();
    const queryFn: Record<
        "bitbucket",
        (params: {
            slug: string;
            type?: string;
        }) => Promise<ApiResponse<Organization>>
    > = {
        bitbucket: bitbucketEndpoints.addOrg,
    };

    return useMutation<Organization, Error, { slug: string; type?: string }>({
        mutationFn: async ({ slug, type }) => {
            const response = await queryFn[provider]({
                slug: slug as string,
                ...(type ? { type } : {}),
            });
            if (!response?.data) {
                throw new Error("No data received from response");
            }
            return response.data;
        },
        onSuccess: (data: Organization) => {
            if (!user) return;
            setUser({
                ...user,
                currentWorkspace: data,
            });
            setSelectedWorkspace(data);
            setWorkspaces([...(workspaces ?? []), data]);
        },
    });
};
