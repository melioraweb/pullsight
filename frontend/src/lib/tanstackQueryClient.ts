// src/lib/tanstack/queryClient.ts
"use client";

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // refetchOnWindowFocus: false,
            // retry: 1,
            // staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 0, // Immediately garbage collect stale data
            staleTime: 0, // Mark data as stale immediately
        },
    },
});
