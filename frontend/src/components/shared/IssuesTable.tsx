import { useDashboardIssuesQuery } from "@/api/queries/dashboard";
import { useGetWorkspaceTeamMembersQuery } from "@/api/queries/workspace";
import Avatar from "@/components/reusable/Avatar";
import Button from "@/components/reusable/Button";
import DataTable from "@/components/reusable/DataTable";
import Dialog from "@/components/reusable/Dialog";
import PrStateBadge from "@/components/reusable/PrStateBadge";
import Select from "@/components/reusable/Select";
import SeverityBadge from "@/components/reusable/SeverityBadge";
import Tabs from "@/components/reusable/Tabs";
import usePagination from "@/hooks/usePagination";
import { formatDate } from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import { Issue } from "@/types/issue";
import { TeamMember } from "@/types/user";
import { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Info } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import MdPreview from "../reusable/MdPreview";

interface IssuesTableProps {
    className?: string;
    fromDate?: string;
    toDate?: string;
    repo?: string | null;
    pullRequest?: string; // New prop for filtering by pull request
    showSeverityTabs?: boolean; // Whether to show the severity filter tabs
    showAuthorFilter?: boolean; // Whether to show the author filter
    showPrStatusFilter?: boolean; // Whether to show the PR status filter
    showPrDetailsBox?: boolean; // Whether to show the PR details box
    showPrColumn?: boolean; // Whether to show the PR column in the table
    title?: string; // Custom title
}

const IssueActionMenu = ({ issue }: { issue: Issue }) => {
    const [showInfo, setShowInfo] = useState(false);
    return (
        <>
            <Button className="bg-transparent text-gray-400 hover:bg-white/10 transition-colors size-5 items-center justify-center p-0" onClick={() => setShowInfo(true)}>
                <Info className="w-auto h-3 inline-block" />
            </Button>
            <Dialog title="Issue Details" size="lg" description="" contentClassName="block" open={showInfo} onOpenChange={setShowInfo}>
                <div className="max-w-full">
                    {/* Header Section */}
                    <div className="border-b border-gray-800 pb-4 mb-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-white mb-2">{issue.category}</h3>
                                <div className="flex items-center gap-2 mb-3">
                                    <SeverityBadge severity={issue.severity} />
                                    
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-900/50 rounded-lg p-3 mt-3">
                            <span className="text-sm text-gray-400">File Path:</span>
                            <p className="text-white font-mono text-sm break-all">{issue.filePath}</p>
                        </div>
                    </div>

                    {/* Issue Content */}
                    {issue.content && (
                        <div className="mb-6">
                            <h4 className="text-lg font-medium text-white mb-3">Issue Content</h4>
                            <div className="bg-gray-900/30 rounded-lg p-4">
                                {issue.codeSnippet && (
                                    <div className="bg-gray-950 rounded border border-gray-700 p-3 mb-3">
                                        <pre className="text-xs overflow-x-auto">
                                            {issue.codeSnippet
                                                .trim()
                                                .split("\n")
                                                .map((line, index) => {
                                                    const lineNumber =
                                                        (issue.codeSnippetLineStart ??
                                                            issue.lineStart) + index;
                                                    const isHighlighted =
                                                        lineNumber >=
                                                            issue.lineStart &&
                                                        lineNumber <= issue.lineEnd;

                                                    return (
                                                        <div
                                                            key={index}
                                                            className="flex"
                                                        >
                                                            <span className="text-gray-500 w-8 text-right pr-2 select-none font-mono flex-shrink-0">
                                                                {lineNumber > 0
                                                                    ? lineNumber
                                                                    : ""}
                                                            </span>
                                                            <code
                                                                className={`flex-1 px-2 ${
                                                                    isHighlighted
                                                                        ? issue.severity ===
                                                                        "critical"
                                                                            ? "bg-red-900/40 text-red-200 border-l-2 border-red-500"
                                                                            : issue.severity ===
                                                                            "warning"
                                                                            ? "bg-yellow-900/40 text-yellow-200 border-l-2 border-yellow-500"
                                                                            : "bg-blue-900/40 text-blue-200 border-l-2 border-blue-500"
                                                                        : "text-gray-300"
                                                                }`}
                                                            >
                                                                {line}
                                                            </code>
                                                        </div>
                                                    );
                                                })}
                                        </pre>
                                    </div>
                                )}
                                <MdPreview content={issue.content || ""} className="text-sm" />
                            </div>
                        </div>
                    )}

                    {/* Pull Request Information */}
                    <div className="mb-6">
                        <h4 className="text-lg font-medium text-white mb-3">Pull Request Information</h4>
                        <div className="bg-gray-900/30 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400">PR:</span>
                                    <span className="text-white font-medium">#{issue.pr}</span>
                                    <a 
                                        href={issue.prUrl} 
                                        target="_blank" 
                                        className="text-blue-400 hover:text-blue-300 transition-colors"
                                        title="View Pull Request"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-gray-400">Author:</span>
                                <div className="flex items-center gap-2">
                                    <Avatar src={""} name={issue.prUser} className="w-6 h-6" />
                                    <span className="text-white">{issue.prUser}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-gray-400">Status:</span>
                                <PrStateBadge state={issue.prState} />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-gray-400">Repository:</span>
                                <span className="text-white">{issue.repositorySlug}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end pt-4 border-t border-gray-800">
                        <Button variant="secondary" onClick={() => setShowInfo(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            </Dialog>
        </>
    );
}

const IssuesTable = ({ 
    className, 
    fromDate, 
    toDate, 
    repo, 
    pullRequest,
    showSeverityTabs = true,
    showAuthorFilter = false,
    showPrStatusFilter = false,
    showPrDetailsBox = false,
    showPrColumn = true,
    title = "Issues"
}: IssuesTableProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [prUser, setPrUser] = useState<string | null>(null);
    const [prState, setPrState] = useState<string | null>(null);
    const [severity, setSeverity] = useState<string | null>(null);

    // Store the last known counts to prevent showing 0 during loading
    const lastCountsRef = useRef<any>(null);

    // Define columns dynamically based on showPrColumn prop
    const columns: ColumnDef<Issue>[] = [
        {
            accessorKey: "category",
            header: "Issue",
            meta: {
                headerClassName: "min-w-64 flex-1",
                cellClassName: "min-w-64 flex-1",
            },
            cell: ({ row }) => (
                <div>
                    <div className="flex gap-2">
                        <span className="text-white mb-1 text-base">
                            {row.getValue("category")}
                        </span>
                        <IssueActionMenu issue={row.original} />
                    </div>
                    <div className="opacity-50 truncate">
                        {row.original?.filePath}
                    </div>
                </div>
            ),
        },
        ...(showPrColumn ? [{
            accessorKey: "prTitle",
            header: "PR",
            cell: ({ row }: { row: any }) => (
                <div>
                    <div className="flex gap-2">
                        <span className="text-white mb-1 text-md">
                            {row.getValue("prTitle")}
                        </span>
                        <a
                            className="opacity-50"
                            href={row.original?.prUrl}
                            target="_blank"
                        >
                            <ExternalLink className="w-auto h-4" />
                        </a>
                    </div>
                    <div className="opacity-50">{row.original?.repositorySlug}</div>
                </div>
            ),
        }] : []),
        {
            accessorKey: "prUser",
            header: "Author",
            cell: ({ row }) => (
                <Avatar src={""} name={row.original?.prUser} className="" />
            ),
        },
        {
            accessorKey: "severity",
            header: "Severity",
            cell: ({ row }) => <SeverityBadge severity={row.original?.severity} />,
        },
        {
            accessorKey: "prState",
            header: "Status",
            cell: ({ row }) => <PrStateBadge state={row.original?.prState} />,
        },
        {
            accessorKey: "daysOpen",
            header: "Days open",
            cell: ({ row }) => (
                <span className="bg-white/5 text-gray-400 rounded-full px-2 py-1 inline-block">
                    {row.original?.daysOpen || 0}
                </span>
            ),
        },
        {
            accessorKey: "updated",
            header: "Updated",
            cell: ({ row }) => (
                <span>{formatDate(row.original?.updated || "")}</span>
            ),
        },
    ];

    const { data: teamMembersData } = useGetWorkspaceTeamMembersQuery({
        isEnabled: true,
        limit: 100,
    });

    const { data, isFetching } = useDashboardIssuesQuery({
        page: currentPage,
        limit: 10,
        from: fromDate,
        to: toDate,
        repo,
        prUser: prUser ? prUser : undefined,
        prState: prState ? prState : undefined,
        severity: severity ? severity : undefined,
        pullRequest: pullRequest ? pullRequest : undefined,
    });

    // reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [fromDate, toDate, repo, prUser, prState, severity, pullRequest]);

    const { Pagination } = usePagination({
        totalPages: data?.data?.totalPages || 1,
        currentPage,
        onPageChange: setCurrentPage,
    });

    // Update the stored counts when new data arrives
    useEffect(() => {
        if (data?.data?.totalCount && !isFetching) {
            lastCountsRef.current = data.data.totalCount;
        }
    }, [data, isFetching]);

    // Use current data if available, otherwise fall back to last known counts
    const displayCounts = data?.data?.totalCount ||
        lastCountsRef.current || {
            total: 0,
            Blocker: 0,
            Critical: 0,
            Major: 0,
            Minor: 0,
            Info: 0,
        };

    return (
        <div className={cn("flex flex-col flex-1", className)}>
            {showPrDetailsBox && data?.data?.pullRequest && (
                <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4 mb-6">
                    <div className="flex lg:items-center gap-4">
                        <Avatar 
                            src={data.data.pullRequest.prUserAvatar} 
                            name={data.data.pullRequest.prUser} 
                            className="w-10 h-10" 
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-white font-semibold text-lg">
                                    {data.data.pullRequest.prTitle}
                                </h3>
                                <a
                                    href={data.data.pullRequest.prUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                    title="View Pull Request"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                            <div className="flex flex-col lg:flex-row lg:items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                                <span>PR #{data.data.pullRequest.prNumber}</span>
                                <span>by {data.data.pullRequest.prUser}</span>
                                <span>{data.data.pullRequest.owner}/{data.data.pullRequest.repo}</span>
                                <PrStateBadge state={data.data.pullRequest.prState} />
                                <span>Created {formatDate(data.data.pullRequest.prCreatedAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {(showSeverityTabs || showAuthorFilter || showPrStatusFilter) && (
                <>
                    <div className="flex flex-wrap md:flex-nowrap items-center gap-x-6 gap-y-2 mb-6">
                        {showSeverityTabs && (
                            <Tabs
                                value={severity || ""}
                                onValueChange={(value) => setSeverity(value)}
                            >
                                <Tabs.List 
                                    className="flex-wrap lg:flex-nowrap"
                                >
                                    <Tabs.Trigger value="">
                                        All ({displayCounts.total})
                                    </Tabs.Trigger>
                                    <Tabs.Trigger value="Blocker">
                                        Blocker ({displayCounts.Blocker})
                                    </Tabs.Trigger>
                                    <Tabs.Trigger value="Critical">
                                        Critical ({displayCounts.Critical})
                                    </Tabs.Trigger>
                                    <Tabs.Trigger value="Major">
                                        Major ({displayCounts.Major})
                                    </Tabs.Trigger>
                                    <Tabs.Trigger value="Minor">
                                        Minor ({displayCounts.Minor})
                                    </Tabs.Trigger>
                                    <Tabs.Trigger value="Info">
                                        Info ({displayCounts.Info})
                                    </Tabs.Trigger>
                                </Tabs.List>
                            </Tabs>
                        )}
                        {/* Author filter */}
                        {showAuthorFilter && (
                            <Select
                                options={[
                                    { value: "", label: "Authors: All" },
                                    ...(teamMembersData?.data?.docs.map(
                                        (member: TeamMember) => ({
                                            value: member.username,
                                            label: member.username,
                                        })
                                    ) || []),
                                ]}
                                value={prUser || ""}
                                onChange={setPrUser}
                            />
                        )}
                        {showPrStatusFilter && (
                            <Select
                                options={[
                                    { value: "", label: "PR Status: All" },
                                    { value: "open", label: "PR Status: Open" },
                                    {
                                        value: "merged",
                                        label: "PR Status: Merged",
                                    },
                                    {
                                        value: "declined",
                                        label: "PR Status: Declined",
                                    },
                                ]}
                                className=""
                                value={prState || ""}
                                onChange={setPrState}
                            />
                        )}
                    </div>
                </>
            )}
            <DataTable
                columns={columns}
                isLoading={isFetching}
                data={data?.data?.issueCardData || []}
            />
            <Pagination />
        </div>
    );
};

export default IssuesTable;
