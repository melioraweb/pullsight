"use client";
import AdminGuard from "@/components/auth/AdminGuard";
import { NavLink } from "@/components/reusable/NavLink";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import { useAppStore } from "@/store/appStore";
import {
    ChartLine,
    CreditCard,
    GitPullRequestArrow,
    House,
    Layers,
    PanelsTopLeft,
    Plus,
    Settings,
    Users,
} from "lucide-react";
import { usePathname } from "next/navigation";

const AppSideBar = () => {
    const pathName = usePathname();
    const { isSidebarOpen, toggleSidebar } = useAppStore();

    return (
        <>
            <header
                className={`w-[260px] p-5 fixed xl:h-[calc(100vh-88px)] h-[calc(100vh-60px)] left-0 bottom-0 xl:top-[88px] top-[60px] bg-background border-r xl:border-r-0 overflow-y-auto transition-transform z-50 xl:translate-x-0 ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <SidebarMenu className="max-w-[200px]">
                    <SidebarMenuItem>
                        <NavLink
                            className="flex items-center font-medium gap-3 pl-3 pr-4 py-3.5 rounded-xl hover:bg-white/10 transition"
                            activeClassName="!bg-white text-gray-800"
                            href={ROUTE_CONSTANTS.APP_DASHBOARD}
                        >
                            <PanelsTopLeft className="h-4 w-4" />
                            <span className="text-base">Dashboard</span>
                        </NavLink>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <NavLink
                            className="flex items-center font-medium gap-3 pl-3 pr-4 py-3.5 rounded-xl hover:bg-white/10 transition"
                            activeClassName="!bg-white text-gray-800"
                            href={ROUTE_CONSTANTS.APP_REPOSITORIES}
                            prefetch
                        >
                            <Layers className="h-4 w-4" />
                            <span className="text-base">Repositories</span>
                        </NavLink>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <NavLink
                            className="flex items-center font-medium gap-3 pl-3 pr-4 py-3.5 rounded-xl hover:bg-white/10 transition"
                            activeClassName="!bg-white text-gray-800"
                            href={ROUTE_CONSTANTS.APP_PULL_REQUESTS}
                            prefetch
                        >
                            <GitPullRequestArrow className="h-4 w-4" />
                            <span className="text-base">Pull requests</span>
                        </NavLink>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <NavLink
                            className="flex items-center font-medium gap-3 pl-3 pr-4 py-3.5 rounded-xl hover:bg-white/10 transition"
                            activeClassName="!bg-white text-gray-800"
                            href={ROUTE_CONSTANTS.APP_TEAM_MEMBERS}
                            prefetch
                        >
                            <Users className="h-4 w-4" />
                            <span className="text-base">Team members</span>
                        </NavLink>
                    </SidebarMenuItem>
                    <AdminGuard>
                        <SidebarMenuItem>
                            <NavLink
                                className="flex items-center font-medium gap-3 pl-3 pr-4 py-3.5 rounded-xl hover:bg-white/10 transition"
                                activeClassName="!bg-white text-gray-800"
                                href={ROUTE_CONSTANTS.APP_SETTINGS}
                                prefetch
                            >
                                <Settings className="h-4 w-4" />
                                <span className="text-base">Settings</span>
                            </NavLink>
                        </SidebarMenuItem>
                    </AdminGuard>
                </SidebarMenu>
            </header>
            {isSidebarOpen && (
                <div
                    className="h-[calc(100vh-60px)] xl:h-[calc(100vh-88px)] top-[60px] xl:top-[88px] w-screen bg-black/10 backdrop-blur-xs left-0 right-0 bottom-0 fixed cursor-pointer z-49"
                    onClick={toggleSidebar}
                ></div>
            )}
        </>
    );
};
export default AppSideBar;
