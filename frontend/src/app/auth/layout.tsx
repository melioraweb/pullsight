import PublicGuardClient from "@/components/auth/PublicGaurdClient";
import { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
    return (
        <PublicGuardClient>
            <div
                className="min-h-screen bg-no-repeat bg-cover bg-center"
                style={{ backgroundImage: "url('/images/gradient-bg.svg')" }}
            >
                <div className="container">{children}</div>
            </div>
        </PublicGuardClient>
    );
};

export default AuthLayout;
