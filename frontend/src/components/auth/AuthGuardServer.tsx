// components/auth/AuthGuardServer.tsx
import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_CONSTANTS, ROUTE_CONSTANTS } from "@/lib/constants";

interface Props {
    children: ReactNode;
}

export async function AuthGuardServer({ children }: Props) {
    const token = (await cookies()).get(AUTH_CONSTANTS.ACCESS_TOKEN)?.value;
    if (!token) {
        redirect(ROUTE_CONSTANTS.LOGIN);
    }

    return <>{children}</>;
}
