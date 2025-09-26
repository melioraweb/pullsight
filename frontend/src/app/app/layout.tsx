import AuthGuardClient from "@/components/auth/AuthGuardClient";
import { AuthGuardServer } from "@/components/auth/AuthGuardServer";
import { ReactNode } from "react";
import AppSideBar from "./SideBar";
import AppTopBar from "./TopBar";

const AppLayout = ({ children }: { children: ReactNode }) => {
    return (
        <AuthGuardServer>
            <AuthGuardClient>
                <AppTopBar />
                <div
                    className={`flex min-h-[calc(100vh-88px)] xl:pt-[88px] xl:pl-[260px] pt-[60px] max-w-screen overflow-hidden `}
                >
                    <AppSideBar />
                    <main className="flex-1 py-5 px-3 lg:px-5 max-w-full">
                        {children}
                    </main>
                </div>
            </AuthGuardClient>
        </AuthGuardServer>
    );
};

export default AppLayout;
