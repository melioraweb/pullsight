// src/lib/tanstack/provider.tsx
"use client";

import { QueryClientProvider, HydrationBoundary } from "@tanstack/react-query";
import { queryClient } from "../lib/tanstackQueryClient";
import { ReactNode } from "react";

interface Props {
    children: ReactNode;
    dehydratedState?: unknown;
}

export function TanstackProvider({ children, dehydratedState }: Props) {
    return (
        <QueryClientProvider client={queryClient}>
            <HydrationBoundary state={dehydratedState}>
                {children}
            </HydrationBoundary>
        </QueryClientProvider>
    );
}
