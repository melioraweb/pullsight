"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useGetWorkspaceRepositoriesQuery } from "@/api/queries/workspace";
import usePagination from "@/hooks/usePagination";
import Tabs from "@/components/reusable/Tabs";
import ContentCard from "@/components/reusable/ContentCard";
import { Button } from "@/components/ui/button";
import AddRepositoryDialog from "./AddRepositoryDialog";
import ResponsiveRepositoryList from "./ResponsiveRepositoryList";
import AdminGuard from "@/components/auth/AdminGuard";

const RepositoriesPage = () => {
    const [tab, setTab] = useState<"all" | "active">("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddDialog, setShowAddDialog] = useState(false);

    const { data, isLoading, isFetching } = useGetWorkspaceRepositoriesQuery({
        isActive: tab === "active" ? true : undefined,
        page: currentPage,
        limit: 10,
        isEnabled: true,
    });

    // Reset to page 1 when tab changes
    useEffect(() => {
        setCurrentPage(1);
    }, [tab]);

    const { Pagination } = usePagination({
        totalPages: data?.data?.totalPages || 1,
        currentPage,
        onPageChange: setCurrentPage,
    });

    return (
        <div className="">
            {/* Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 mb-3">
                <h2 className="text-2xl font-semibold">Repositories</h2>
                <AdminGuard>
                    <Button
                        variant="outline"
                        onClick={() => setShowAddDialog(true)}
                    >
                        <Plus />
                        <span className="ml-2">Add Repository</span>
                    </Button>
                </AdminGuard>
            </div>

            {/* Add Repository Dialog */}
            <AddRepositoryDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
            />

            {/* Table */}
            <ContentCard className="">
                <ContentCard.Header className="flex items-center gap-2">
                    <h2 className="text-sm  text-[#71717A] font-semibold">
                        Repositories
                    </h2>
                </ContentCard.Header>
                <ContentCard.Body>
                    {/* Filters Row */}
                    <div className="flex items-center justify-between mb-3 gap-3">
                        <Tabs
                            value={tab}
                            onValueChange={(value) =>
                                setTab(value as "all" | "active")
                            }
                        >
                            <Tabs.List>
                                <Tabs.Trigger value="all">All</Tabs.Trigger>
                                <Tabs.Trigger value="active">
                                    Active
                                </Tabs.Trigger>
                            </Tabs.List>
                        </Tabs>

                        {/* <Select
                            options={[
                                { value: "", label: "Authors: All" },
                                { value: "noelle", label: "Noelle Ruiz" },
                                { value: "john", label: "John Doe" },
                            ]}
                        />

                        <Select
                            options={[
                                { value: "", label: "Date: All" },
                                { value: "today", label: "Today" },
                                { value: "week", label: "This Week" },
                                { value: "month", label: "This Month" },
                            ]}
                        />

                        <div className="flex border border-gray-700 rounded-md">
                            <button className="p-2  text-gray-300 hover:bg-gray-700">
                                <List size={18} />
                            </button>
                            <button className="p-2  text-gray-400 hover:bg-gray-700">
                                <Grid size={18} />
                            </button>
                        </div> */}
                    </div>
                    <ResponsiveRepositoryList
                        data={data?.data?.docs || []}
                        isLoading={isFetching}
                    />
                    <Pagination />
                </ContentCard.Body>
            </ContentCard>
        </div>
    );
};
export default RepositoriesPage;
