import { Provider } from "@/types/user";
import { ApiResponse, PaginatedResponse } from "@/types/response";
import { githubEndpoints } from "../endpoints/github";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Repository } from "@/types/repository";
import { bitbucketEndpoints } from "../endpoints/bitbucket";

interface UseRepositoryQueryParams {
    provider?: Provider;
    isEnabled?: boolean;
    filter?: string;
    page?: number;
    limit?: number;
}

export const useRepositoryQuery = ({
    provider = "github",
    isEnabled = true,
    filter = "",
}: UseRepositoryQueryParams) => {
    const queryFnMap: Record<
        Provider,
        ({ filter }: { filter: string }) => Promise<ApiResponse<Repository[]>>
    > = {
        github: githubEndpoints.getRepos,
        bitbucket: bitbucketEndpoints.getRepos,
    };

    const queryFn = queryFnMap[provider];
    if (!queryFn) {
        throw new Error(`Unsupported provider: ${provider}`);
    }

    return useQuery<Repository[], Error>({
        queryKey: ["repos"],
        queryFn: async () => {
            const response = await queryFn({
                filter,
            });
            if (!response?.data) {
                throw new Error("No data received from response");
            }
            return response.data;
        },
        enabled: isEnabled,
        retry: 2,
    });
};

export const useOtherRepositoryQuery = ({
    page = 1,
    limit = 10,
    provider = "github",
    isEnabled = true,
}: UseRepositoryQueryParams) => {
    const queryFnMap: Record<
        Provider,
        ({
            page,
            limit,
        }: {
            page: number;
            limit: number;
        }) => Promise<PaginatedResponse<Repository>>
    > = {
        github: githubEndpoints.getOtherRepos,
        bitbucket: bitbucketEndpoints.getOtherRepos,
    };

    const queryFn = queryFnMap[provider];
    if (!queryFn) {
        throw new Error(`Unsupported provider: ${provider}`);
    }

    return useQuery<PaginatedResponse<Repository>, Error>({
        queryKey: ["other-repos"],
        queryFn: async () => {
            const response = await queryFn({
                page,
                limit,
            });
            if (!response?.data) {
                throw new Error("No data received from response");
            }
            return response;
        },
        enabled: isEnabled,
        retry: 2,
    });
};

// Mutation for adding repositories to workspace
interface AddRepositoryParams {
    repositories: {
        id: string;
        name: string;
        provider: Provider;
        external_id?: number;
        slug?: string;
    }[];
}

export const useAddRepositoryMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: AddRepositoryParams) => {
            // TODO: Replace with actual API endpoint
            // For now, we'll simulate an API call
            console.log("Adding repositories:", params);

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Simulate potential error for testing
            if (Math.random() > 0.8) {
                throw new Error("Failed to add repositories");
            }

            return {
                success: true,
                message: `Successfully added ${params.repositories.length} repository(ies)`,
                data: params.repositories,
            };

            // When API is ready, replace above with:
            // return await axiosInstance.post('/api/workspace/repositories/add', params);
        },
        onSuccess: () => {
            // Invalidate and refetch workspace repositories
            queryClient.invalidateQueries({
                queryKey: ["workspace-repositories"],
            });
        },
        onError: (error) => {
            console.error("Failed to add repositories:", error);
        },
    });
};
