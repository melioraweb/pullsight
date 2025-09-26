import apiClient from "@/lib/axios";

export const analysisEndpoints = {
    getPRAnalysis: async (analysisId: string) =>
        apiClient.get(`/analysis/${analysisId}`).then((res) => res.data),
};
