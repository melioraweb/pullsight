"use client";

import { useUpdateUserMutation } from "@/api/queries/auth";
import AdminGuard from "@/components/auth/AdminGuard";
import LogoutHandler from "@/components/auth/LogoutHandler";
import Dropdown from "@/components/reusable/Dropdown";
import CircularProgress from "@/components/reusable/CircularProgress";
import { Button } from "@/components/ui/button";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import { getRemainingDays, isPlanExpired } from "@/lib/dayjs";
import showToast from "@/lib/toast";
import { cn, numToHip } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import { ChevronDown, LogOutIcon, Plus, Rocket, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { Fragment, use } from "react";

const AppTopBar = () => {
    const pathName = usePathname();
    const { user, workspaces, selectedWorkspace, myRoleInSelectedWorkspace } =
        useAuthStore((s) => s);
    const { toggleSidebar, isSidebarOpen } = useAppStore();

    const {
        mutateAsync: updateUser,
        isPending: isUpdatingUser,
        error: updateUserError,
    } = useUpdateUserMutation();

    const onboardedWorkspaces = workspaces?.filter(
        (workspace) =>
            !workspace.onboardingStep || workspace.onboardingStep == 0
    );



    // Custom 3x3 Grid Icon Component
    const GridIcon = () => (
        <div className="w-4 h-4 grid grid-cols-3 gap-[2px]">
            {Array.from({ length: 9 }).map((_, i) => (
                <div
                    key={i}
                    className="w-[3px] h-[3px] bg-current rounded-[1px]"
                />
            ))}
        </div>
    );

    const handleAddNewWorkspace = () => {
        updateUser({
            currentWorkspace: null,
        }).then(() => {
            redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_1);
        });
    };

    const handleWorkspaceChange = async (workspaceId: string) => {
        if (selectedWorkspace?._id === workspaceId) {
            return;
        }

        await updateUser({
            currentWorkspace: workspaceId,
            updateState: false, // for not updating state of selectedWorkspace
        }).then(() => {
            window.location.href = ROUTE_CONSTANTS.APP_DASHBOARD;
            // showToast.success("Organization switched successfully!");
        });
    };

    return (
        <div className="xl:h-[88px] h-[60px] flex items-center border-b gap-x-2 lg:gap-x-4 xl:px-5 pr-3 pl-1 fixed top-0 left-0 right-0 z-40 bg-background">
            <Button
                variant="ghost"
                className="xl:hidden relative px-3"
                onClick={toggleSidebar}
            >
                <div className="relative w-4 h-4">
                    {/* Grid Icon */}
                    <div
                        className={`absolute inset-0 transition-all duration-300 ${
                            isSidebarOpen
                                ? "opacity-0 rotate-90 scale-75"
                                : "opacity-100 rotate-0 scale-100"
                        }`}
                    >
                        <GridIcon />
                    </div>

                    {/* Cross Icon */}
                    <div
                        className={`absolute -left-0.5 -top-0.5 transition-all duration-300 ${
                            isSidebarOpen
                                ? "opacity-100 rotate-0 scale-100"
                                : "opacity-0 rotate-90 scale-75"
                        }`}
                    >
                        <X className="!h-5 !w-5" />
                    </div>
                </div>
            </Button>
            <Image
                src="/images/logo-icon.svg"
                alt="pull sight logo"
                width={23}
                height={37}
                className="xl:h-auto w-auto h-[30px]"
            />
            <span className="text-base font-medium hidden md:inline">
                Welcome back, {user?.displayName || user?.username} 👋
            </span>

            <Dropdown>
                <Dropdown.Trigger>
                    <Button
                        variant="ghost"
                        className={cn(
                            "justify-between bg-[var(--box-800)] flex items-center !h-auto !px-3 rounded-2xl gap-3 xl:gap-5 w-[150px] xl:w-[214px] ml-auto"
                        )}
                    >
                        <div className="text-left flex-shrink-0 min-w-0 flex-1">
                            <div className="truncate">
                                {selectedWorkspace?.name}
                            </div>
                            <div className="opacity-60 text-xs truncate">
                                {user?.email || "n/a"}
                            </div>
                        </div>
                        <ChevronDown className="flex-shrink-0" />
                    </Button>
                </Dropdown.Trigger>
                <Dropdown.Content className="py-3 px-1 w-[214px] flex flex-col">
                    <div className="text-xs uppercase text-muted px-2">
                        Switch Organization
                    </div>
                    <div className="mt-3 mb-3 space-y-1">
                        {onboardedWorkspaces?.map((ws) => {
                            if (typeof ws === "string")
                                return <Fragment key={ws} />;
                            return (
                                <div
                                    key={ws._id}
                                    className={`py-2 px-3 rounded-xl cursor-pointer hover:bg-neutral-800 transition-colors ${
                                        selectedWorkspace?._id === ws._id
                                            ? "bg-neutral-800"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleWorkspaceChange(ws._id)
                                    }
                                >
                                    {ws.name}
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-center">
                        <Button
                            variant="outline"
                            className="!border-primary text-primary"
                            size="xs"
                            onClick={handleAddNewWorkspace}
                        >
                            <Plus />
                            Add new organization
                        </Button>
                    </div>
                    <hr className="my-4 mx-2" />
                    <LogoutHandler asChild>
                        <Button
                            variant="outline"
                            className="mx-2 text-white text-sm border-0 cursor-pointer hover:underline underline-offset-4 "
                        >
                            <LogOutIcon />
                            Logout
                        </Button>
                    </LogoutHandler>
                </Dropdown.Content>
            </Dropdown>
        </div>
    );
};

export default AppTopBar;
