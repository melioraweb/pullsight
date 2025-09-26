// components/auth/AuthGuard.tsx
"use client";

import { redirect } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import Image from "next/image";

const PublicGuardClient = ({ children }: { children: ReactNode }) => {
    const user = useAuthStore((s) => s.user);
    const hydrated = useAuthStore((s) => s.hydrated);

    useEffect(() => {
        if (user && hydrated) {
            redirect(ROUTE_CONSTANTS.APP_DASHBOARD);
        }
    }, [user, hydrated]);

    if (!hydrated)
        return (
            <div className="h-screen bg-dark-900 flex items-center justify-center">
                <Image
                    src="/images/logo.svg"
                    alt="pullsight logo"
                    width={99}
                    height={35}
                    className=""
                />
            </div>
        );

    return <>{children}</>;
};

export default PublicGuardClient;
