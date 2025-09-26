"use client";

import { TeamMember } from "@/types/user";
import { Card, CardContent } from "@/components/ui/card";
import Avatar from "../../../components/reusable/Avatar";
import { formatDate } from "@/lib/dayjs";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import ConfirmDialog from "@/components/reusable/ConfirmDialog";
import { useUpdateTeamMemberMutation } from "@/api/queries/workspace";
import { User, Calendar } from "lucide-react";

interface TeamMemberCardProps {
    member: TeamMember;
}

const TeamMemberCard = ({ member }: TeamMemberCardProps) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const { mutateAsync } = useUpdateTeamMemberMutation();

    const isActive = member.isActive ?? true;
    const memberName = member.displayName || member.username;

    const handleStatusChange = async () => {
        try {
            await mutateAsync({
                members: [{ ...member, isActive: !isActive }],
            });
            setShowConfirm(false);
        } catch (error) {
            console.error("Failed to update team member status:", error);
        }
    };

    return (
        <>
            <Card className="p-4">
                <CardContent className="p-0">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar
                                src={member.avatarUrl || ""}
                                name={memberName}
                                size="md"
                                hideDetails
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium truncate">
                                    {memberName}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="w-3 h-3" />
                                    <span className="truncate">
                                        @{member.username}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                        Joined{" "}
                                        {member.joinedAt
                                            ? formatDate(member.joinedAt)
                                            : "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Switch
                                checked={isActive}
                                onCheckedChange={() => setShowConfirm(true)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ConfirmDialog
                open={showConfirm}
                onOpenChange={setShowConfirm}
                title={
                    isActive ? "Deactivate Team Member" : "Activate Team Member"
                }
                description={`Are you sure you want to ${
                    isActive ? "deactivate" : "activate"
                } ${memberName}?`}
                onConfirm={handleStatusChange}
                confirmText={isActive ? "Deactivate" : "Activate"}
                variant={isActive ? "destructive" : "default"}
            />
        </>
    );
};

export default TeamMemberCard;
