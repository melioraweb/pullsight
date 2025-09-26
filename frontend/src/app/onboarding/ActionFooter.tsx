"use client";

import { FC } from "react";
import {
    ArrowRightIcon,
    LoadingIcon,
    ArrowLeftIcon,
    RightBarArrowIcon,
} from "@/components/reusable/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useUpdateUserMutation } from "@/api/queries/auth";

interface ActionFooterProps {
    buttonText?: string;
    isEnabled?: boolean;
    isLoading?: boolean;
    onClick?: () => void;
    backButtonText?: string;
    onBackClick?: () => void;
    confirmButtonClassname?: string;
    confirmButtonSubtitle?: string;
}

const ActionFooter: FC<ActionFooterProps> = ({
    buttonText,
    onClick,
    isEnabled = false,
    isLoading = false,
    backButtonText = "Back",
    onBackClick,
    confirmButtonClassname,
    confirmButtonSubtitle,
}) => {
    const { workspaces } = useAuthStore();
    const onboardedWorkspaces = workspaces
        ?.filter(
            (workspace) =>
                !workspace.onboardingStep || workspace.onboardingStep == 0
        )
        ?.map((ws) => ws._id);

    const {
        mutateAsync: updateUser,
        isPending: isUpdatingUser,
        error: updateUserError,
    } = useUpdateUserMutation();

    const handleBackToDashboard = () => {
        if (!onboardedWorkspaces?.length) return;
        updateUser({
            currentWorkspace: onboardedWorkspaces[0],
        });
    };

    return (
        <div className="fixed left-0 right-0 bottom-0 py-3 w-full z-10 bg-background">
            <div className="container flex items-center">
                {backButtonText && onBackClick && (
                    <button
                        className="text-base pr-3 py-2.5 rounded-2xl flex items-center text-[var(--subtitle-300)] hover:text-[var(--subtitle-100)] cursor-pointer"
                        onClick={onBackClick}
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        <span className="hidden md:block">
                            {backButtonText}
                        </span>
                    </button>
                )}
                <div className="ml-auto gap-3 flex items-center">
                    {onboardedWorkspaces && onboardedWorkspaces?.length > 0 && (
                        <button
                            className={cn(
                                "text-base pr-3 py-2.5 rounded-2xl flex items-center text-[var(--subtitle-300)] hover:text-[var(--subtitle-100)] cursor-pointer"
                            )}
                            onClick={handleBackToDashboard}
                        >
                            <ArrowLeftIcon className="w-5 h-5 mr-2" />
                            <span className="hidden md:block">
                                Back to Dashboard
                            </span>
                        </button>
                    )}
                    <div className="gap-1 flex flex-col items-end">
                        {buttonText && onClick && (
                            <Button
                                className={cn(
                                    isEnabled
                                        ? "!bg-white !text-black hover:!bg-gray-200 cursor-pointer"
                                        : "bg-[var(--box-800)] text-[var(--subtitle-500)]",
                                    confirmButtonClassname
                                )}
                                onClick={onClick}
                                disabled={!isEnabled}
                                size={"xl"}
                            >
                                <span>{buttonText}</span>
                                {isLoading ? (
                                    <LoadingIcon className="w-5 h-5 ml-2" />
                                ) : (
                                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                                )}
                            </Button>
                        )}
                        {confirmButtonSubtitle && (
                            <div className="text-muted text-sm">
                                {confirmButtonSubtitle}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionFooter;
