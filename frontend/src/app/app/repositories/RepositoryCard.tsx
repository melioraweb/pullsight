"use client";

import { Repository } from "@/types/repository";
import { Card, CardContent } from "@/components/ui/card";
import Avatar from "../../../components/reusable/Avatar";
import { formatDate } from "@/lib/dayjs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "@/components/reusable/ConfirmDialog";
import { useUpdateRepositoryMutation } from "@/api/queries/workspace";
import RepositorySettingsModal from "./RepositorySettingsModal";
import showToast from "@/lib/toast";

interface RepositoryCardProps {
    repository: Repository & { isActive?: boolean; updatedOn?: string };
}

const RepositoryCard = ({ repository }: RepositoryCardProps) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const { mutateAsync } = useUpdateRepositoryMutation();

    const isActive = repository.isActive ?? true; // Default to true if not provided

    const handleStatusChange = async () => {
        await mutateAsync({
            id: repository._id,
            data: { isActive: !isActive },
        }).catch((error) => {
            showToast.error("Failed to update repository status");
        }).finally(() => {
            setShowConfirm(false);
        });
    };

    return (
        <>
            <Card className="p-4">
                <CardContent className="p-0">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium truncate hover:underline cursor-pointer">
                                {repository.name}
                            </h3>
                            <div className="flex flex-col gap-3 mt-2 text-sm text-gray-400">
                                <Avatar
                                    src={repository.author?.avatarUrl || ""}
                                    name={
                                        repository.author?.username || "Unknown"
                                    }
                                    size="sm"
                                    className="w-5 h-5"
                                />
                                <span className="whitespace-nowrap">
                                    {formatDate(
                                        repository.updatedOn ||
                                            repository.updatedAt ||
                                            ""
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                            <Switch
                                checked={isActive}
                                onCheckedChange={() => setShowConfirm(true)}
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSettings(true)}
                                className="h-8 w-8 p-0"
                            >
                                <Settings className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ConfirmDialog
                open={showConfirm}
                onOpenChange={setShowConfirm}
                title={
                    isActive ? "Deactivate Repository" : "Activate Repository"
                }
                description={`Are you sure you want to ${
                    isActive ? "deactivate" : "activate"
                } this repository?`}
                onConfirm={handleStatusChange}
                confirmText={isActive ? "Deactivate" : "Activate"}
                variant={isActive ? "destructive" : "default"}
            />

            <RepositorySettingsModal
                repository={repository}
                open={showSettings}
                onOpenChange={setShowSettings}
            />
        </>
    );
};

export default RepositoryCard;
