"use client";

import ContentCard from "@/components/reusable/ContentCard";
import { useState, useEffect } from "react";
import PrAnalysisCard from "./prAnalysisCard";
import { subtractDays, formatDate } from "@/lib/dayjs";
import IssueAnalysisCard from "./issueAnalysisCard";
import TimeMoneySavedCard from "./timeMoneySavedCard";
import { useGetWorkspaceRepositoriesQuery } from "@/api/queries/workspace";
import Select from "@/components/reusable/Select";
import { Repository } from "@/types/repository";
import OnboardingCongratsModal from "./OnboardingCongratsModal";
import { useSearchParams, useRouter } from "next/navigation";
import IssuesCard from "./issuesCard";

const DashboardPage = () => {
    const [selectedPeriod, setSelectedPeriod] = useState<string>("7");

    // Initialize dates immediately based on default period
    const initializeDates = (period: string) => {
        const days = parseInt(period);
        const today = new Date();
        return {
            fromDate: formatDate(subtractDays(today, days - 1), "YYYY-MM-DD"),
            toDate: formatDate(today, "YYYY-MM-DD"),
        };
    };

    const initialDates = initializeDates(selectedPeriod);
    const [fromDate, setFromDate] = useState<string | null>(
        initialDates.fromDate
    );
    const [toDate, setToDate] = useState<string | null>(initialDates.toDate);
    const [repo, setRepo] = useState<string | null>(null);
    const [breakdown, setBreakdown] = useState<string>("day");
    const [showCongrats, setShowCongrats] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();

    const { data: repoData } = useGetWorkspaceRepositoriesQuery({
        isEnabled: true,
        limit: 100,
    });

    // Check for congratulations flag and show modal once
    useEffect(() => {
        const congratsParam = searchParams.get("showCongrats");
        if (congratsParam === "true") {
            setShowCongrats(true);
            // Clean up the URL parameter immediately to prevent showing again
            const url = new URL(window.location.href);
            url.searchParams.delete("showCongrats");
            router.replace(url.pathname + url.search);
        }
    }, [searchParams, router]);

    const handlePeriodChange = (value: string) => {
        setSelectedPeriod(value);
        const days = parseInt(value);
        const today = new Date();
        // Use formatDate helper for local date formatting
        // Format: YYYY-MM-DD for API compatibility
        const newToDate = formatDate(today, "YYYY-MM-DD");
        const newFromDate = formatDate(
            subtractDays(today, days - 1),
            "YYYY-MM-DD"
        );
        setFromDate(newFromDate);
        setToDate(newToDate);
    };

    const handleRepoChange = (value: string) => {
        setRepo(value || null);
    };

    return (
        <>
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3 mb-3 lg:sticky lg:top-0 bg-background pt-3 pb-2 z-10 ">
                <h2 className="text-2xl font-semibold">Dashboard</h2>
                <div className="ml-auto flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <Select
                        className="bg-background"
                        options={[
                            { value: "", label: "Repositories: All" },
                            ...(repoData?.data?.docs.map(
                                (repo: Repository) => ({
                                    value: repo.name,
                                    label: repo.name,
                                })
                            ) || []),
                        ]}
                        value={repo || ""}
                        onChange={handleRepoChange}
                    />
                    <Select
                        className="bg-background"
                        options={[
                            { value: "7", label: "Period: Last 7 Days" },
                            { value: "15", label: "Period: Last 15 Days" },
                            { value: "30", label: "Period: Last 30 Days" },
                            { value: "60", label: "Period: Last 60 Days" },
                            { value: "90", label: "Period: Last 90 Days" },
                            { value: "180", label: "Period: Last 180 Days" },
                            { value: "365", label: "Period: Last 365 Days" },
                        ]}
                        value={selectedPeriod}
                        onChange={handlePeriodChange}
                    />
                    <Select
                        className="bg-background"
                        options={[
                            { value: "day", label: "Breakdown: Days" },
                            // { value: "week", label: "Breakdown: Weeks" },
                            { value: "month", label: "Breakdown: Months" },
                            { value: "year", label: "Breakdown: Years" },
                        ]}
                        value={breakdown}
                        onChange={setBreakdown}
                    />
                </div>
            </div>
            <div className="grid grid-cols-12 gap-5">
                <PrAnalysisCard
                    className="col-span-12 lg:col-span-6 xl:col-span-4"
                    fromDate={fromDate || undefined}
                    toDate={toDate || undefined}
                    repo={repo || undefined}
                    breakdown={breakdown || undefined}
                />
                <IssueAnalysisCard
                    className="col-span-12 lg:col-span-6 xl:col-span-4"
                    fromDate={fromDate || undefined}
                    toDate={toDate || undefined}
                    repo={repo || undefined}
                    breakdown={breakdown || undefined}
                />
                <TimeMoneySavedCard
                    className="col-span-12 lg:col-span-12 xl:col-span-4"
                    fromDate={fromDate || undefined}
                    toDate={toDate || undefined}
                    repo={repo || undefined}
                    breakdown={breakdown || undefined}
                />
                <IssuesCard
                    className="col-span-12"
                    fromDate={fromDate || undefined}
                    toDate={toDate || undefined}
                    repo={repo || undefined}
                />
            </div>

            {/* Onboarding Congratulations Modal */}
            <OnboardingCongratsModal
                open={showCongrats}
                onOpenChange={setShowCongrats}
            />
        </>
    );
};

export default DashboardPage;
