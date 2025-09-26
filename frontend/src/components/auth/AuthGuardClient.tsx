// components/auth/AuthGuard.tsx
"use client";

import { redirect, usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import Image from "next/image";

export default function AuthGuardClient({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { user, hydrated, selectedWorkspace, myRoleInSelectedWorkspace } =
        useAuthStore((s) => s);

    useEffect(() => {
        console.log(
            "First effect",
            user,
            selectedWorkspace,
            myRoleInSelectedWorkspace
        );
        if (!hydrated) return; // Wait for hydration

        // redirect to login if user is not authenticated
        if (!user && !pathname.includes(ROUTE_CONSTANTS.AUTH)) {
            redirect(ROUTE_CONSTANTS.LOGIN);
        }

        // redirect to onboarding if user is authenticated but no workspace is selected
        if (
            (!selectedWorkspace ||
                (selectedWorkspace?.onboardingStep &&
                    selectedWorkspace?.onboardingStep > 0)) &&
            !pathname.includes(ROUTE_CONSTANTS.ONBOARDING)
        ) {
            const onboardingStep = selectedWorkspace?.onboardingStep;
            if (onboardingStep === 2) {
                redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_2);
            } else if (onboardingStep === 3) {
                redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_3);
            } else if (onboardingStep === 4) {
                redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_4);
            } else if (onboardingStep === 5) {
                redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_5);
            } else {
                redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_1);
            }
        }

        // redirect to dashboard if user is authenticated and workspace is selected
        if (
            user &&
            selectedWorkspace &&
            (!selectedWorkspace.onboardingStep ||
                selectedWorkspace.onboardingStep == 0) &&
            !pathname.includes(ROUTE_CONSTANTS.APP)
        ) {
            redirect(ROUTE_CONSTANTS.APP_DASHBOARD);
        }
    }, [user, hydrated, selectedWorkspace]);


    if (!hydrated)
        return (
            <div className="h-screen bg-dark-900 flex items-center justify-center">
                <Image
                    src="/images/logo.svg"
                    alt="pullsight logo"
                    width={99}
                    height={35}
                    className=""
                    priority
                />
            </div>
        );

    return <>{children}</>;
}
