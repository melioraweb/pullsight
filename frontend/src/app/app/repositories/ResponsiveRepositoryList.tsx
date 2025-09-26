"use client";

import { Repository } from "@/types/repository";
import DataTable from "@/components/reusable/DataTable";
import { columns } from "./tableColumns";
import RepositoryCard from "./RepositoryCard";

interface ResponsiveRepositoryListProps {
    data: Repository[];
    isLoading: boolean;
}

const ResponsiveRepositoryList = ({
    data,
    isLoading,
}: ResponsiveRepositoryListProps) => {
    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
                <DataTable
                    columns={columns}
                    isLoading={isLoading}
                    data={data}
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
                                        <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
                                        <div className="flex flex-col gap-3">
                                            <div className="h-4 bg-gray-700 rounded w-20"></div>
                                            <div className="h-4 bg-gray-700 rounded w-16"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-6 bg-gray-700 rounded-full"></div>
                                        <div className="w-8 h-8 bg-gray-700 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : data.length > 0 ? (
                    <div className="space-y-3">
                        {data.map((repository) => (
                            <RepositoryCard
                                key={repository._id}
                                repository={repository}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted p-6 border rounded-xl">
                        No repositories found.
                    </div>
                )}
            </div>
        </>
    );
};

export default ResponsiveRepositoryList;
