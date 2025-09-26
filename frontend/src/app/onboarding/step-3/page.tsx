"use client";

import { Organization } from "@/types/organization";
import ActionFooter from "../ActionFooter";
import SelectableList from "../SelectableList";
import { useState } from "react";
import { PullRequest } from "@/types/pullRequest";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { usePullRequestQuery } from "@/api/queries/pullRequest";
import { useAuthStore } from "@/store/authStore";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import ContentCard from "@/components/reusable/ContentCard";
import Avatar from "@/components/reusable/Avatar";
import { formatDate, humanizeDate } from "@/lib/dayjs";
import Badge from "@/components/reusable/Badge";
import { useSearchable } from "@/hooks/use-searchable";

const Step3Page = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const user = useAuthStore((s) => s.user);

    const repoId = searchParams.get("repoId") as string;
    const prId = searchParams.get("prId") as string;

    if (!repoId) {
        redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_2);
    }

    const [selectedPR, setSelectedPR] = useState<string>(prId || "");

    const {
        data: pullRequests,
        refetch: refetchPullRequests,
        isFetching,
        error,
    } = usePullRequestQuery({
        provider: user?.provider || "github", // Default to GitHub if not set
        repoId,
    });
    const { searchInput, filteredData } = useSearchable({
        data: pullRequests || [],
        searchFn: (item, search) =>
            search.trim()
                ? item.prTitle.toLowerCase().includes(search.toLowerCase())
                : true,
        inputProps: {
            className: "order-1 md:order-0 md:ml-auto w-full md:w-auto",
        },
    });

    const onStepComplete = () => {
        if (pullRequests?.length === 0) {
            redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_5 + `?repoId=${repoId}`);
        }
        if (!selectedPR) return;
        // You can add your API call or navigation logic here

        redirect(
            ROUTE_CONSTANTS.ONBOARDING_STEP_4 +
                `?prId=${selectedPR}&repoId=${repoId}`
        );
    };

    return (
        <>
            <div className="grid grid-cols-12 gap-4 lg:gap-8">
                {/* Left column */}
                <div className="col-span-12 xl:col-span-4 xl:pr-16">
                    <h2 className="text-4xl font-medium text-[var(--title-50)] mb-4 leading-[45px]">
                        Let&apos;s See the AI in Action on Your Code
                    </h2>
                    <p className="text-base font-medium text-[var(--subtitle-400)] mb-6">
                        We&apos;ve identified active Pull Requests in your
                        selected repositories. Choose one to generate your very
                        first AI-powered analysis right now!
                    </p>
                </div>

                {/* Right column */}
                <div className="col-span-12 xl:col-span-8">
                    <ContentCard>
                        <ContentCard.Header className="flex-wrap md:flex-nowrap gap-y-4 items-start md:items-center">
                            <h3 className="text-[var(--title-50)] font-medium text-lg">
                                PRs list
                            </h3>
                            {searchInput}
                            <Button
                                variant="outline"
                                size="icon"
                                className="ml-auto md:ml-0"
                                onClick={() => refetchPullRequests()}
                            >
                                <RefreshCw className="inline mr-1" />
                            </Button>
                        </ContentCard.Header>
                        <ContentCard.Body
                            className="lg:max-h-[calc(100vh-650px)] xl:max-h-[calc(100vh-450px)]"
                            hasError={!!error}
                            isLoading={isFetching}
                            errorLabel={
                                error
                                    ? "Error loading pull requests. Please try again."
                                    : undefined
                            }
                            noContentLabel={
                                pullRequests && pullRequests?.length === 0
                                    ? "No pull requests found. Please add a pull request to analyze."
                                    : undefined
                            }
                        >
                            <SelectableList
                                items={filteredData || []}
                                selectedId={selectedPR}
                                onSelect={(prNumber) => setSelectedPR(prNumber)}
                                getKey={(item) => String(item.prNumber)}
                                renderItem={(item) => (
                                    <div className="grid grid-cols-8 items-center flex-grow-1 gap-3 text-sm">
                                        <div className="col-span-8 lg:hidden">
                                            <div className="flex gap-2">
                                                <span className="truncate">
                                                    {item?.prTitle}
                                                </span>
                                                <Badge
                                                    className="ml-auto"
                                                    variant={
                                                        item?.prState ===
                                                            "merged" ||
                                                        item?.prState ===
                                                            "closed"
                                                            ? "destructive"
                                                            : "success"
                                                    }
                                                >
                                                    {item.prState}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-1 text-muted mt-1">
                                                <span className="">by:</span>
                                                <span className="font-semibold truncate">
                                                    {item?.prUser}
                                                </span>
                                                <span className="mx-1">|</span>
                                                <span>at:</span>
                                                <span className="">
                                                    {formatDate(
                                                        item.prCreatedAt || ""
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <h4 className="col-span-3 hidden lg:block">
                                            {item?.prTitle}
                                        </h4>
                                        <Avatar
                                            className="col-span-2 hidden lg:flex"
                                            src={item?.prUserAvatar || ""}
                                            name={item?.prUser}
                                        />
                                        <div className="col-span-1 text-center text-[var(--subtitle-500)] text-sm whitespace-nowrap hidden lg:block">
                                            <Badge
                                                variant={
                                                    item?.prState ===
                                                        "merged" ||
                                                    item?.prState === "closed"
                                                        ? "destructive"
                                                        : "success"
                                                }
                                            >
                                                {item.prState}
                                            </Badge>
                                        </div>
                                        <div className="col-span-1 text-right text-[var(--subtitle-500)] text-sm whitespace-nowrap hidden lg:block">
                                            {formatDate(item.prCreatedAt || "")}
                                        </div>
                                        <div className="col-span-1 text-right text-[var(--subtitle-500)] text-sm whitespace-nowrap hidden lg:block">
                                            {formatDate(item.prUpdatedAt || "")}
                                        </div>
                                    </div>
                                )}
                                renderHeader={() => (
                                    <div className="ml-9 md:grid grid-cols-8 gap-3 py-2 px-4 text-[var(--subtitle-400)] text-xs hidden">
                                        <div className="col-span-3">Title</div>
                                        <div className="col-span-2">Author</div>
                                        <div className="col-span-1 text-center">
                                            Status
                                        </div>
                                        <div className="col-span-1 text-right">
                                            Created At
                                        </div>
                                        <div className="col-span-1 text-right">
                                            Updated at
                                        </div>
                                    </div>
                                )}
                            />
                        </ContentCard.Body>
                    </ContentCard>
                </div>
            </div>

            {/* Footer with action button */}
            <ActionFooter
                buttonText={
                    pullRequests?.length === 0
                        ? "Skip pr analysis"
                        : "Analyze Pull Request"
                }
                isEnabled={
                    pullRequests?.length == 0 ||
                    (Boolean(selectedPR) && !isFetching)
                }
                isLoading={isFetching}
                onClick={onStepComplete}
                onBackClick={() => redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_2)}
            />
        </>
    );
};

export default Step3Page;
