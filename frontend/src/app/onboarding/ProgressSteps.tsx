"use client";

import {
    CheckedIcon,
    CircleIcon,
    StepOnProgressIcon,
} from "@/components/reusable/icons";
import { useAuthStore } from "@/store/authStore";
import { usePathname } from "next/navigation";
import React, { FC } from "react";

interface Step {
    id: string;
    label: string;
    status: "complete" | "current" | "incomplete";
}

interface ProgressStepsProps {
    onStepClick?: (stepId: string) => void;
}

const stepsData = [
    {
        index: 0,
        id: "git",
        label: "Git connected",
    },
    {
        index: 1,
        id: "org",
        label: "Connect Organization",
    },
    {
        index: 2,
        id: "repos",
        label: "Choose Repositories",
    },
    {
        index: 3,
        id: "prs",
        label: "Choose Pull Requests",
    },
    {
        index: 4,
        id: "ai",
        label: "Generate AI Analysis on PR",
    },
    {
        index: 5,
        id: "final",
        label: "Final set up",
    },
];

const ProgressSteps: FC<ProgressStepsProps> = ({ onStepClick }) => {
    const user = useAuthStore((s) => s.user);
    const pathname = usePathname();
    // step number from pathname
    const stepMatch = pathname.match(/step-(\d+)/);
    const currentStep = stepMatch ? parseInt(stepMatch[1]) : 1;

    const steps = stepsData.map((step) => ({
        ...step,
        status:
            step.index < currentStep
                ? "complete"
                : step.index === currentStep
                ? "current"
                : "incomplete",
    })) as Array<{
        index: number;
        id: string;
        label: string;
        status: "complete" | "current" | "incomplete";
    }>;

    const icons = {
        complete: <CheckedIcon size={15} className="fill-primary" />,
        current: <CircleIcon size={15} className="fill-[var(--title-50)]" />,
        incomplete: (
            <CircleIcon size={15} className="fill-[var(--overbox-600)]" />
        ),
        progressBar: <StepOnProgressIcon />, // only used on current
    };

    return (
        <div className="flex items-start gap-3 md:gap-5 mt-12 max-h-full overflow-hidden overflow-x-auto">
            {steps.map((step) => {
                const { status, id, label } = step;
                const isComplete = status === "complete";
                const isCurrent = status === "current";
                const isIncomplete = status === "incomplete";

                const bar = isComplete ? (
                    <div className="h-3 bg-primary w-full rounded-full"></div>
                ) : isCurrent && icons.progressBar ? (
                    <div className="h-3 w-full rounded-full relative overflow-hidden bg-primary bg-stripes bg-size-[1rem_1rem] animate-stripes">
                        {/* {icons.progressBar} */}
                    </div>
                ) : (
                    <div className="h-3 bg-[var(--box-800)] w-full rounded-full"></div>
                );

                const textColor = isComplete
                    ? "text-[var(--title-50)]"
                    : isCurrent
                    ? "text-[var(--title-50)]"
                    : "text-[var(--overbox-600)]";

                const icon = isComplete
                    ? icons.complete
                    : isCurrent
                    ? icons.current
                    : icons.incomplete;

                return (
                    <div
                        key={id}
                        className="flex flex-col w-1/6"
                        onClick={() => onStepClick?.(id)}
                    >
                        {bar}

                        <div className="flex mt-3 justify-center lg:justify-start items-start">
                            <div className="rounded-full w-4 h-4 flex items-center justify-center mt-[1px]">
                                {icon}
                            </div>
                            <div
                                className={`ml-2 ${textColor} font-medium text-sm hidden md:block`}
                            >
                                {label}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ProgressSteps;
