"use client";

import { Organization } from "@/types/organization";
import ActionFooter from "../ActionFooter";
import SelectableList from "../SelectableList";
import { useEffect, useState } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import {
    usePullRequestAnalysisQuery,
    useReviewPullRequestQuery,
} from "@/api/queries/pullRequest";
import PrCodeAnalysis from "./PrCodeAnalysis";
import Image from "next/image";
import { formatDate } from "@/lib/dayjs";
import { PRAnalysisData } from "@/types/prAnalysis";
import Avatar from "@/components/reusable/Avatar";
import Badge from "@/components/reusable/Badge";

const Step4Page = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const user = useAuthStore((s) => s.user);

    const [analysisId, setAnalysisId] = useState<string | null>(null);

    const repoId = searchParams.get("repoId") as string;
    const prId = searchParams.get("prId") as string;

    if (!repoId || !prId) {
        redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_3);
    }

    const { data, isLoading, error } = useReviewPullRequestQuery({
        provider: user?.provider || "github", // Default to GitHub if not set
        repoId,
        prId,
    });
    const {
        data: analysisData,
        isLoading: isLoadingAnalysis,
        error: analysisError,
    } = usePullRequestAnalysisQuery({
        analysisId: analysisId || "",
        enabled: !!analysisId,
    });

    const onStepComplete = () => {
        redirect(
            ROUTE_CONSTANTS.ONBOARDING_STEP_5 + `?prId=${prId}&repoId=${repoId}`
        );
    };

    useEffect(() => {
        if (data) {
            setAnalysisId(data.pullRequestAnalysisId);
        }
    }, [data]);

    return (
        <>
            <div className="grid grid-cols-12 gap-4 lg:gap-8">
                {/* Left column */}
                <div className="col-span-12 xl:col-span-4 xl:pr-16">
                    <h2 className="text-4xl font-medium text-[var(--title-50)] mb-4 leading-[45px]">
                        Generate your first AI-powered review
                    </h2>
                    <p className="text-base font-medium text-[var(--subtitle-400)] mb-6">
                        Please wait a moment. Our AI is now deeply analyzing PR
                        Improve database query performance to identify potential
                        bugs, performance bottlenecks, security flaws, and style
                        inconsistencies.
                    </p>
                </div>

                {/* Right column */}
                <div className="col-span-12 xl:col-span-8">
                    <div className="mb-4 relative">
                        <h3 className="text-[var(--title-50)] font-medium mb-4 text-lg">
                            PR Summary
                        </h3>
                        {data && data?.pullRequest && (
                            <>
                                <div className="hidden md:grid grid-cols-12 py-3 text-[var(--subtitle-400)] text-sm font-medium">
                                    <div className="col-span-5 pl-3">Title</div>
                                    <div className="col-span-2 pl-1">
                                        Author
                                    </div>
                                    <div className="col-span-1 text-center">
                                        Status
                                    </div>
                                    <div className="col-span-2 text-right pr-3">
                                        Created at
                                    </div>
                                    <div className="col-span-2 text-right pr-4">
                                        Updated at
                                    </div>
                                </div>

                                <div className="grid grid-cols-12 items-center py-3 bg-[var(--box-800)] rounded-lg gap-3">
                                    <div className="col-span-12 px-3 sm:hidden">
                                        <div className="flex gap-2 items-start">
                                            <span className="truncate-2">
                                                {data?.pullRequest?.prTitle}
                                            </span>
                                            <Badge
                                                className="ml-auto"
                                                variant={
                                                    data?.pullRequest
                                                        ?.prState ===
                                                        "merged" ||
                                                    data?.pullRequest
                                                        ?.prState === "closed"
                                                        ? "destructive"
                                                        : "success"
                                                }
                                            >
                                                {data?.pullRequest.prState}
                                            </Badge>
                                        </div>
                                        <div className="flex gap-1 text-muted mt-1">
                                            <span className="">by:</span>
                                            <span className="font-semibold truncate">
                                                {data?.pullRequest?.prUser}
                                            </span>
                                            <span className="mx-1">|</span>
                                            <span>at:</span>
                                            <span className="">
                                                {formatDate(
                                                    data?.pullRequest
                                                        .prCreatedAt || ""
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-span-5 hidden sm:block px-3">
                                        <span className="text-[var(--title-50)] text-base font-medium">
                                            {data?.pullRequest?.prTitle}
                                        </span>
                                    </div>
                                    <div className="col-span-2 hidden sm:block">
                                        <Avatar
                                            className=""
                                            src={
                                                data?.pullRequest
                                                    ?.prUserAvatar || ""
                                            }
                                            name={
                                                data?.pullRequest?.prUser ||
                                                "Unknown"
                                            }
                                        />
                                    </div>
                                    <div className="col-span-1 text-center hidden sm:block">
                                        <Badge
                                            variant={
                                                data?.pullRequest?.prState ===
                                                    "merged" ||
                                                data?.pullRequest?.prState ===
                                                    "closed"
                                                    ? "destructive"
                                                    : "success"
                                            }
                                        >
                                            {data?.pullRequest?.prState}
                                        </Badge>
                                    </div>
                                    <div className="col-span-2 text-right text-sm hidden sm:block">
                                        {formatDate(
                                            data?.pullRequest?.createdAt
                                        )}
                                    </div>
                                    <div className="col-span-2 text-right text-sm pr-4 hidden sm:block">
                                        {formatDate(
                                            data?.pullRequest?.updatedAt
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="bg-dark-900 mt-3">
                            {(isLoading || isLoadingAnalysis) && (
                                <p className="text-[var(--subtitle-400)] p-5">
                                    Loading PR summary...
                                </p>
                            )}
                            {(error || analysisError) && (
                                <p className="text-[var(--subtitle-400)] p-7">
                                    Error loading PR summary. Please try again.
                                </p>
                            )}

                            {(data?.pullRequestAnalysis || analysisData) && (
                                <PrCodeAnalysis
                                    analysisData={
                                        (analysisData as PRAnalysisData) ||
                                        data?.pullRequestAnalysis
                                    }
                                    pullRequest={data?.pullRequest}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer with action button */}
            <ActionFooter
                buttonText="Set up"
                isEnabled={!isLoading && analysisData?.status === "completed"}
                isLoading={isLoading}
                onClick={onStepComplete}
                onBackClick={() =>
                    redirect(
                        ROUTE_CONSTANTS.ONBOARDING_STEP_3 +
                            "?repoId=" +
                            repoId +
                            "&prId=" +
                            prId
                    )
                }
            />
        </>
    );
};

export default Step4Page;
