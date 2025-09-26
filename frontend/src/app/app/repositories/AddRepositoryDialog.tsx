"use client";

import { useState } from "react";
import { Search, GitBranch, X, RefreshCw } from "lucide-react";
import {
    useOtherRepositoryQuery,
    useAddRepositoryMutation,
    useRepositoryQuery,
} from "@/api/queries/repository";
import Dialog from "@/components/reusable/Dialog";
import Input from "@/components/reusable/Input";
import DataTable from "@/components/reusable/DataTable";
import { Repository } from "@/types/repository";
import { showToast } from "@/lib/toast";
import usePagination from "@/hooks/usePagination";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import Badge from "@/components/reusable/Badge";
import { useAddRepositoriesMutation } from "@/api/queries/workspace";
import Button from "@/components/reusable/Button";

interface AddRepositoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Define columns for the repository table
const createColumns = (
    selectedRepos: Repository[],
    onRepoToggle: (repo: Repository) => void
): ColumnDef<Repository>[] => [
    {
        id: "select",
        header: "",
        cell: ({ row }) => {
            const isSelected = selectedRepos.some(
                (r) => r.id === row.original.id
            );
            return (
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onRepoToggle(row.original)}
                    aria-label="Select repository"
                />
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Repository Name",
        cell: ({ row }) => {
            const repo = row.original;
            return (
                <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-gray-500" />
                    <div>
                        <div className="font-medium text-sm">{repo.name}</div>
                        <div className="text-xs text-gray-500">
                            {repo.slug || repo.name}
                        </div>
                    </div>
                </div>
            );
        },
        enableColumnFilter: true,
        filterFn: (row, columnId, filterValue) => {
            const repo = row.original;
            const searchText = filterValue?.toLowerCase() || "";
            return (
                repo.name.toLowerCase().includes(searchText) ||
                repo.slug?.toLowerCase().includes(searchText) ||
                false
            );
        },
    },
    {
        accessorKey: "createdOn",
        header: "Created",
        cell: ({ row }) => {
            const date = row.getValue("createdOn") as
                | string
                | number
                | Date
                | null
                | undefined;
            return date ? (
                <div className="text-sm text-gray-600">{formatDate(date)}</div>
            ) : (
                <div className="text-sm text-gray-400">-</div>
            );
        },
    },
];

const AddRepositoryDialog = ({
    open,
    onOpenChange,
}: AddRepositoryDialogProps) => {
    const [selectedRepos, setSelectedRepos] = useState<Repository[]>([]);
    const [columnFilters, setColumnFilters] = useState<
        { id: string; value: unknown }[]
    >([]);

    const { user, selectedWorkspace } = useAuthStore();

    // Fetch other repositories for the dialog with pagination
    const {
        data,
        isFetching: isLoadingOtherRepos,
        refetch: refetchRepositories,
    } = useRepositoryQuery({
        provider: user?.provider || "github", // Default to GitHub if not set
        isEnabled: open,
        filter: "available",
    });

    // Mutation for adding repositories
    const { mutateAsync, isPending } = useAddRepositoriesMutation();

    // Handle repository selection
    const handleRepoToggle = (repo: Repository) => {
        setSelectedRepos((prev) => {
            const isSelected = prev.some((r) => r.id === repo.id);
            if (isSelected) {
                return prev.filter((r) => r.id !== repo.id);
            } else {
                return [...prev, repo];
            }
        });
    };

    // Create table columns
    const columns = createColumns(selectedRepos, handleRepoToggle);

    // Handle adding repositories
    const handleAddRepositories = async () => {
        if (selectedRepos.length === 0) {
            showToast.error("Please select at least one repository");
            return;
        }
        const repositories = selectedRepos.map((repo) => {
            return {
                ...repo,
                id: repo.id.toString(),
            };
        });

        await mutateAsync({
            repositories,
        })
            .then(() => {
                handleDialogClose();
                showToast.success(
                    `Successfully added ${selectedRepos.length} repositor${
                        selectedRepos.length === 1 ? "y" : "ies"
                    }`
                );
            })
            .catch((error) => {
                console.error("Failed to add repositories:", error);
            });
    };

    // Handle dialog close
    const handleDialogClose = () => {
        if (!isPending) {
            onOpenChange(false);
            setSelectedRepos([]);
            setColumnFilters([]);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={handleDialogClose}
            title="Add Repositories"
            description="Select repositories from your connected workspace to analyze Pull Requests. Here you're seeing list of repositories accessible to PullSight."
            size="lg"
            actions={[
                {
                    label: "Cancel",
                    onClick: handleDialogClose,
                    variant: "outline",
                    disabled: isPending,
                },
                {
                    label: `Add Repository${
                        selectedRepos.length !== 1 ? "ies" : ""
                    }`,
                    onClick: handleAddRepositories,
                    variant: "default",
                    loading: isPending,
                    disabled: selectedRepos.length === 0,
                },
            ]}
            closeOnOverlayClick={!isPending}
        >
            <div className="space-y-4">
                {selectedWorkspace?.provider == "github" && (
                    <div className="border rounded-lg p-3 flex flex-col lg:flex-row gap-3">
                        <p className="text-sm text-muted-foreground">
                            Missing repositories? Ensure that PullSight has
                            access to your GitHub repositories.
                        </p>

                        <Button
                            variant="outline"
                            size="icon"
                            className="ml-auto md:ml-0"
                            onClick={() => refetchRepositories()}
                            title="Refresh repositories"
                        >
                            <RefreshCw className="inline" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                const url =
                                    selectedWorkspace.type == "Organization"
                                        ? `https://github.com/organizations/${selectedWorkspace.slug}/settings/installations/${selectedWorkspace.installationId}`
                                        : `https://github.com/settings/installations/${selectedWorkspace.installationId}`;
                                window.open(url, "_blank");
                            }}
                        >
                            Grant Access
                        </Button>
                    </div>
                )}
                {/* Search Input */}
                <Input
                    placeholder="Search repositories..."
                    value={
                        (columnFilters.find((f) => f.id === "name")
                            ?.value as string) || ""
                    }
                    onChange={(e) => {
                        const value = e.target.value;
                        setColumnFilters((prev) => {
                            const otherFilters = prev.filter(
                                (f) => f.id !== "name"
                            );
                            return value
                                ? [...otherFilters, { id: "name", value }]
                                : otherFilters;
                        });
                    }}
                    leftIcon={<Search className="h-4 w-4" />}
                    className="w-full"
                />

                {/* Repository Table */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                    <DataTable
                        isLoading={isLoadingOtherRepos}
                        columns={columns}
                        data={data || []}
                        columnFilters={columnFilters}
                        onColumnFiltersChange={setColumnFilters}
                        className="min-w-full"
                    />

                    {/* Pagination */}
                    {/* <Pagination /> */}
                </div>

                {/* Selection Summary */}
                {selectedRepos.length > 0 && (
                    <div className="border  p-3 rounded-md">
                        <p className="text-sm">
                            <strong>{selectedRepos.length}</strong> repository
                            {selectedRepos.length !== 1 ? "ies" : ""} selected
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {selectedRepos.map((repo) => (
                                <Badge
                                    key={repo.id}
                                    type="faded"
                                    className="items-center"
                                >
                                    {repo.name}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRepoToggle(repo);
                                        }}
                                        className="p-1 cursor-pointer"
                                        type="button"
                                    >
                                        <X height={12} width="auto" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Dialog>
    );
};

export default AddRepositoryDialog;
