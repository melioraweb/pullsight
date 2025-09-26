"use client";

import { TeamMember } from "@/types/user";
import DataTable from "@/components/reusable/DataTable";
import { columns } from "./tableColumns";
import TeamMemberCard from "./TeamMemberCard";

interface ResponsiveTeamMemberListProps {
    data: TeamMember[];
    isLoading: boolean;
}

const ResponsiveTeamMemberList = ({
    data,
    isLoading,
}: ResponsiveTeamMemberListProps) => {
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
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
                                            <div className="h-4 bg-gray-700 rounded w-1/2 mb-1"></div>
                                            <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="w-10 h-6 bg-gray-700 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : data.length > 0 ? (
                    <div className="space-y-3">
                        {data.map((member) => (
                            <TeamMemberCard
                                key={member._id || member.username}
                                member={member}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted p-6 border rounded-xl">
                        No team members found.
                    </div>
                )}
            </div>
        </>
    );
};

export default ResponsiveTeamMemberList;
