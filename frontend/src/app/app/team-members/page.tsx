"use client";

import { useGetWorkspaceTeamMembersQuery } from "@/api/queries/workspace";
import ContentCard from "@/components/reusable/ContentCard";
import usePagination from "@/hooks/usePagination";
import { useState } from "react";
import { useOrganizationMembersQuery } from "@/api/queries/member";
import { useAuthStore } from "@/store/authStore";
import ResponsiveTeamMemberList from "./ResponsiveTeamMemberList";
import { TeamMember } from "@/types/user";
import InviteMemberModal from "./InviteMemberModal";
import Button from "@/components/reusable/Button";
import { Plus } from "lucide-react";

const TeamActivityPage = () => {
    const [showInvite, setShowInvite] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const user = useAuthStore((s) => s.user);
    const provider = user?.provider || "github";

    // const { data, isFetching } = useGetWorkspaceTeamMembersQuery({
    //     page: currentPage,
    //     limit: 10,
    //     isEnabled: true,
    // });
    const {
        data: _data = [],
        isFetching,
        error,
    } = useOrganizationMembersQuery({
        provider,
    });

    const data = _data.sort((a: TeamMember, b: TeamMember) =>
        a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1
    );

    return (
        <div className="">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-2 mb-3">
                <div>
                    <h2 className="text-2xl font-semibold">Team Members</h2>
                    <div className="text-neutral-400 text-sm">
                        Invited team members would receive AI code reviews and
                        would have access to the app.
                    </div>
                </div>
                <Button variant="outline" onClick={() => setShowInvite(true)}>
                    <div className="flex items-center">
                        <Plus className="mr-2 h-4 w-4" />
                        Invite Members
                    </div>
                </Button>
            </div>
            {/* Table */}
            <ContentCard className="">
                <ContentCard.Header className="flex items-center gap-2">
                    <h2 className="text-sm  text-[#71717A] font-semibold">
                        Team Members
                    </h2>
                </ContentCard.Header>
                <ContentCard.Body>
                    <ResponsiveTeamMemberList
                        data={data || []}
                        isLoading={isFetching}
                    />
                </ContentCard.Body>
            </ContentCard>
            <InviteMemberModal open={showInvite} onOpenChange={setShowInvite} />
        </div>
    );
};

export default TeamActivityPage;
