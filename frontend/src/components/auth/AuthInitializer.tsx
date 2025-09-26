import { AUTH_CONSTANTS } from "@/lib/constants";
import { headers } from "next/headers";
import HydrateUser from "./HydrateUser";
import { FC, ReactNode } from "react";
import { authEndpoints } from "@/api/endpoints/auth";

const AuthInitializer: FC<{ children: ReactNode }> = async ({ children }) => {
    const headersList = headers();
    const cookie = (await headersList).get("cookie");
    const token = cookie
        ?.split("; ")
        .find((c) => c.startsWith(AUTH_CONSTANTS.ACCESS_TOKEN));
    let user = null;

    if (token) {
        try {
            const data = await authEndpoints.getUserFromServer(token);
            user = data.data;
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    }
    return (
        <>
            <HydrateUser user={user} />
            {children}
        </>
    );
};

export default AuthInitializer;
