"use client";

import { PullRequest } from "@/types/pullRequest";
import DataTable from "@/components/reusable/DataTable";
import { columns } from "./tableColumns";
import PullRequestCard from "./PullRequestCard";

interface ResponsivePullRequestListProps {
    data: PullRequest[];
    isLoading: boolean;
    onRowClick?: (pullRequest: PullRequest) => void;
}

const ResponsivePullRequestList = ({
    data,
    isLoading,
    onRowClick,
}: ResponsivePullRequestListProps) => {
    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
                <DataTable
                    columns={columns}
                    isLoading={isLoading}
                    data={data}
                    onRowClick={onRowClick}
                />
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-card rounded-xl border p-4 animate-pulse"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-700 rounded w-8 mb-2"></div>
                                        <div className="h-5 bg-gray-700 rounded w-4/5 mb-2"></div>
                                        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 bg-gray-700 rounded-full"></div>
                                            <div className="h-4 bg-gray-700 rounded w-20"></div>
                                            <div className="h-4 bg-gray-700 rounded w-16"></div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="h-6 bg-gray-700 rounded w-16"></div>
                                        <div className="w-4 h-4 bg-gray-700 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : data.length > 0 ? (
                    <div className="space-y-3">
                        {data.map((pullRequest) => (
                            <PullRequestCard
                                key={`${pullRequest._id}`}
                                pullRequest={pullRequest}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted p-6 border rounded-xl">
                        No pull requests found.
                    </div>
                )}
            </div>
        </>
    );
};

export default ResponsivePullRequestList;
