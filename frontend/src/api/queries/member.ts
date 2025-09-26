import { ApiResponse } from "@/types/response";
import { Provider, User } from "@/types/user";
import { githubEndpoints } from "../endpoints/github";
import { bitbucketEndpoints } from "../endpoints/bitbucket";
import { useQuery } from "@tanstack/react-query";

export const useOrganizationMembersQuery = ({
    provider,
    isEnabled,
}: {
    provider: Provider;
    isEnabled?: boolean;
}) => {
    const queryFnMap: Record<Provider, () => Promise<ApiResponse<User[]>>> = {
        github: githubEndpoints.getTeamMembers,
        bitbucket: bitbucketEndpoints.getTeamMembers
    };

    const queryFn = queryFnMap[provider];
    if (!queryFn) {
        throw new Error(`Unsupported provider: ${provider}`);
    }

    return useQuery<User[], Error>({
        queryKey: ["teamMembers"],
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
