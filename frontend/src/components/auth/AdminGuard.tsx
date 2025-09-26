"use client";

import { useAuthStore } from "@/store/authStore";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const AdminGuard = ({
    children,
    shouldRedirectTo403,
}: {
    children: ReactNode;
    shouldRedirectTo403?: boolean;
}) => {
    const { myRoleInSelectedWorkspace } = useAuthStore();
    if (myRoleInSelectedWorkspace !== "admin") {
        if (shouldRedirectTo403) {
            // Redirect to 403 page
            redirect("/403");
        }
        return null;
    }
    return <>{children}</>;
};

export default AdminGuard;
