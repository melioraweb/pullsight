"use client";

import { Switch } from "@/components/ui/switch";
import { ColumnDef } from "@tanstack/react-table";
import { Repository } from "@/types/repository";
import Avatar from "../../../components/reusable/Avatar";
import { formatDate } from "@/lib/dayjs";
import { useState } from "react";
import ConfirmDialog from "@/components/reusable/ConfirmDialog";
import { useUpdateRepositoryMutation } from "@/api/queries/workspace";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import RepositorySettingsModal from "./RepositorySettingsModal";
import AdminGuard from "@/components/auth/AdminGuard";

interface RepositoryStatusSwitchProps {
    isActive: boolean;
    repositoryId: string;
}

const RepositoryStatusSwitch = ({
    isActive,
    repositoryId,
}: RepositoryStatusSwitchProps) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const { mutateAsync } = useUpdateRepositoryMutation();

    const handleConfirm = async () => {
        try {
            await mutateAsync({
                id: repositoryId,
                data: { isActive: !isActive },
            });
            setShowConfirm(false);
        } catch (error) {
            console.error("Failed to update repository status:", error);
        }
    };

    return (
        <>
            <Switch
                checked={isActive}
                onCheckedChange={() => setShowConfirm(true)}
            />
            <ConfirmDialog
                open={showConfirm}
                onOpenChange={setShowConfirm}
                title={
                    isActive ? "Deactivate Repository" : "Activate Repository"
                }
                description={`Are you sure you want to ${
                    isActive ? "deactivate" : "activate"
                } this repository?`}
                onConfirm={handleConfirm}
                confirmText={isActive ? "Deactivate" : "Activate"}
                variant={isActive ? "destructive" : "default"}
            />
        </>
    );
};

interface RepositorySettingsActionProps {
    repository: Repository;
}

const RepositorySettingsAction = ({
    repository,
}: RepositorySettingsActionProps) => {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <>
            <AdminGuard>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(true)}
                    className="h-8 w-8 p-0"
                >
                    <Settings className="h-4 w-4" />
                </Button>
                <RepositorySettingsModal
                    repository={repository}
                    open={showSettings}
                    onOpenChange={setShowSettings}
                />
            </AdminGuard>
        </>
    );
};

export const columns: ColumnDef<Repository>[] = [
    {
        accessorKey: "isActive",
        header: "",
        meta: {
            headerClassName: "w-15",
            cellClassName: "w-15",
        },
        cell: ({ row }) => {
            const active = row.getValue("isActive") as boolean;
            const repositoryId = row.original._id;
            return (
                <AdminGuard>
                    <RepositoryStatusSwitch
                        isActive={active}
                        repositoryId={repositoryId}
                    />
                </AdminGuard>
            );
        },
    },
    {
        accessorKey: "name",
        header: "Repository name",
        meta: {
            headerClassName: "min-w-48 flex-1",
            cellClassName: "min-w-48 flex-1",
        },
        cell: ({ row }) => {
            const name = row.getValue("name") as string;
            return <div className="text-white  min-w-0 truncate">{name}</div>;
        },
    },
    {
        accessorKey: "author",
        header: "Author",
        meta: {
            headerClassName: "w-60",
            cellClassName: "w-60",
        },
        cell: ({ row }) => {
            const author =
                (row.getValue("author") as {
                    avatarUrl?: string;
                    username?: string;
                }) || {};
            return (
                <Avatar
                    src={author?.avatarUrl || ""}
                    name={author?.username || "Unknown"}
                    size="sm"
                />
            );
        },
    },
    {
        accessorKey: "updatedOn",
        header: "Updated",
        meta: {
            headerClassName: "w-32",
            cellClassName: "w-32",
        },
        cell: ({ row }) => {
            const updated = row.getValue("updatedOn") as string | undefined;
            return (
                <span className="text-gray-400">
                    {formatDate(updated || "")}
                </span> // fallback if empty
            );
        },
    },
    {
        id: "actions",
        header: "",
        meta: {
            headerClassName: "w-16",
            cellClassName: "w-16",
        },
        cell: ({ row }) => {
            return <RepositorySettingsAction repository={row.original} />;
        },
        enableSorting: false,
        enableHiding: false,
    },
];
