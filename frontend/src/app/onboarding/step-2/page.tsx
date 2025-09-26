"use client";

import ActionFooter from "../ActionFooter";
import SelectableList from "../SelectableList";
import { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useRepositoryQuery } from "@/api/queries/repository";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Repository } from "@/types/repository";
import ContentCard from "@/components/reusable/ContentCard";
import Avatar from "@/components/reusable/Avatar";
import { formatDate, humanizeDate } from "@/lib/dayjs";
import { useSearchable } from "@/hooks/use-searchable";

const Step2Page = () => {
    const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const provider = user?.provider || "github";

    const {
        data: repositories = [],
        refetch: refetchRepositories,
        isFetching,
        error,
    } = useRepositoryQuery({
        provider,
    });

    const { searchInput, filteredData } = useSearchable({
        data: Array.isArray(repositories) ? repositories : [],
        searchFn: (item, search) =>
            search.trim()
                ? item.name.toLowerCase().includes(search.toLowerCase())
                : true,
        inputProps: {
            className: "order-1 md:order-0 md:ml-auto w-full md:w-auto",
        },
    });

    const onStepComplete = () => {
        if (repositories?.length === 0) {
            router.push(ROUTE_CONSTANTS.ONBOARDING_STEP_5);
            return;
        }
        if (!selectedRepo) return;
        router.push(
            ROUTE_CONSTANTS.ONBOARDING_STEP_3 + `?repoId=${selectedRepo.slug}`
        );
    };

    return (
        <>
            <div className="grid grid-cols-12 gap-4 lg:gap-8">
                {/* Left column */}
                <div className="col-span-12 xl:col-span-4 xl:col-start-2 xl:pr-16">
                    <h2 className="text-4xl font-medium text-[var(--title-50)] mb-4 leading-[45px]">
                        Select Repositories for AI Analysis
                    </h2>
                    <p className="text-base font-medium text-[var(--subtitle-400)] mb-6">
                        Choose the repositories you&apos;d like PullSight to
                        monitor for Pull Requests. Our AI will automatically
                        analyze new or updated PRs in these repos to provide
                        instant feedback.
                    </p>
                </div>

                {/* Right column */}
                <div className="col-span-12 xl:col-span-6">
                    <ContentCard>
                        <ContentCard.Header className="flex-wrap md:flex-nowrap gap-y-4 items-start md:items-center">
                            <h3 className="text-[var(--title-50)] font-medium text-lg">
                                Repositories List
                            </h3>
                            {searchInput}
                            <Button
                                variant="outline"
                                size="icon"
                                className="ml-auto md:ml-0"
                                onClick={() => refetchRepositories()}
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
                                    ? "Error loading repositories. Please try again."
                                    : undefined
                            }
                            noContentLabel={
                                repositories && repositories?.length === 0
                                    ? "No repositories found. Please add a repository to continue."
                                    : undefined
                            }
                        >
                            <SelectableList
                                items={filteredData || []}
                                selectedId={selectedRepo?.name}
                                onSelect={(name) =>
                                    setSelectedRepo(
                                        repositories?.find(
                                            (repo) => repo.name === name
                                        ) || null
                                    )
                                }
                                getKey={(item) => String(item.name)}
                                renderItem={(item) => (
                                    <div className="grid grid-cols-5 items-center gap-4 flex-grow-1 text-sm">
                                        <div className="col-span-5 sm:col-span-2">
                                            <h4>{item.name}</h4>
                                            <div className="flex gap-2 text-muted sm:hidden">
                                                <span>created by:</span>
                                                <span>
                                                    {item.author?.username}
                                                </span>
                                            </div>
                                        </div>
                                        <Avatar
                                            className="col-span-2 hidden sm:flex"
                                            src={item.author?.avatarUrl || ""}
                                            name={item.author?.username}
                                        />
                                        <div className="col-span-1 text-right text-[var(--subtitle-500)] text-sm whitespace-nowrap  hidden sm:block">
                                            {formatDate(item.createdOn || "")}
                                        </div>
                                    </div>
                                )}
                                renderHeader={() => (
                                    <div className="ml-9 md:grid grid-cols-5 gap-4 py-2 px-4 text-[var(--subtitle-400)] text-xs hidden">
                                        <div className="col-span-2">Title</div>
                                        <div className="col-span-2">Author</div>
                                        <div className="col-span-1 text-right">
                                            Created at
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
                    repositories?.length === 0
                        ? "Skip pr analysis"
                        : "Select Repository"
                }
                isEnabled={Boolean(selectedRepo) && !isFetching}
                onClick={onStepComplete}
                isLoading={isFetching}
                onBackClick={() => redirect(ROUTE_CONSTANTS.ONBOARDING_STEP_1)}
            />
        </>
    );
};

export default Step2Page;
