"use client";

import { Switch } from "@/components/ui/switch";
import { ColumnDef } from "@tanstack/react-table";
import { Repository } from "@/types/repository";
import { PullRequest } from "@/types/pullRequest";
import Avatar from "@/components/reusable/Avatar";
import Badge from "@/components/reusable/Badge";
import { formatDate } from "@/lib/dayjs";
import PrStateBadge from "@/components/reusable/PrStateBadge";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { ROUTE_CONSTANTS } from "@/lib/constants";
import { generatePath } from "@/lib/utils";

export const columns: ColumnDef<PullRequest>[] = [
    {
        accessorKey: "prTitle",
        header: "PR Title",
        meta: {
            headerClassName: "min-w-64 flex-1",
            cellClassName: "min-w-64 flex-1",
        },
        cell: ({ row }) => (
            <div className="2xl:max-w-xl xl:max-w-md lg:max-w-sm max-w-sm">
                {/* <span className="text-white mb-1 text-base text-wrap">
                    {row.getValue("prTitle")}
                </span> */}
                <div className="flex gap-2">
                    <span className="text-white mb-1 text-base text-wrap">
                        {row.getValue("prTitle")}
                    </span>
                    <a
                        className="opacity-50"
                        href={row.original?.prUrl}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ExternalLink className="w-auto h-4" />
                    </a>
                </div>
                <div className="opacity-50">{row.original?.repo}</div>
            </div>
        ),
    },
    {
        accessorKey: "prTotalLineAddition",
        header: "Lines Changed",
        meta: {
            headerClassName: "w-32",
            cellClassName: "w-32",
        },
        cell: ({ row }) => {
            const additions = row.original?.prTotalLineAddition as number | undefined;
            const deletions = row.original?.prTotalLineDeletion as number | undefined;
            return (
                <div className="flex flex-col text-sm">
                    <div className="flex gap-1 items-center">
                        <span className="text-gray-400 text-xs w-8">Add:</span>
                        <span className="font-semibold text-green-600">
                            {additions ? `+${additions.toLocaleString()}` : "+0"}
                        </span>
                    </div>
                    <div className="flex gap-1 items-center">
                        <span className="text-gray-400 text-xs w-8">Del:</span>
                        <span className="font-semibold text-red-600">
                            {deletions ? `-${deletions.toLocaleString()}` : "-0"}
                        </span>
                    </div>
                </div>
            );
        }
    },
    {
        accessorKey: "pullRequestAnalysis",
        header: "Token Usage",
        meta: {
            headerClassName: "w-40",
            cellClassName: "w-40",
        },
        cell: ({ row }) => {
            const totalInputTokens = row.original?.pullRequestAnalysis?.reduce((acc, curr) => acc + (curr?.usageInfo?.input_tokens || 0) + (curr?.prReviewUsageInfo?.input_tokens || 0), 0) || 0;
            const totalOutputTokens = row.original?.pullRequestAnalysis?.reduce((acc, curr) => acc + (curr?.usageInfo?.output_tokens || 0) + (curr?.prReviewUsageInfo?.output_tokens || 0), 0) || 0;
            return (
                <div className="">
                    <div className="flex gap-1 items-center">
                        <span className="text-gray-400 text-xs w-12">Input:</span>
                        <span className="font-semibold">
                            {(totalInputTokens || 0).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex gap-1 items-center">
                        <span className="text-gray-400 text-xs w-12">Output:</span>
                        <span className="font-semibold">
                            {(totalOutputTokens || 0).toLocaleString()}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "prUser",
        header: "Author",
        meta: {
            headerClassName: "w-40",
            cellClassName: "w-40",
        },
        cell: ({ row }) => {
            return (
                <Avatar
                    src={row.original?.prUserAvatar || ""}
                    name={row.getValue("prUser") || "Unknown"}
                    size="sm"
                />
            );
        },
    },
    {
        accessorKey: "prState",
        header: "PR Status",
        meta: {
            headerClassName: "w-28",
            cellClassName: "w-28",
        },
        cell: ({ row }) => (
            <PrStateBadge state={row.getValue("prState") as string} />
        ),
    },
    {
        accessorKey: "issueCount",
        header: "Issues",
        meta: {
            headerClassName: "w-28",
            cellClassName: "w-28",
        },
        cell: ({ row }) => {
            const issueCount = row.getValue("issueCount") as number | undefined;
            return (
                <span className="bg-white/5 text-gray-400 rounded-full px-2 py-1 inline-block">
                    {issueCount || 0}
                </span>
            );
        },
    },
    {
        accessorKey: "prUpdatedAt",
        header: "Updated",
        meta: {
            headerClassName: "w-28",
            cellClassName: "w-28",
        },
        cell: ({ row }) => {
            const updated = row.getValue("prUpdatedAt") as string | undefined;
            return (
                <span className="text-gray-400">
                    {formatDate(updated || "")}
                </span>
            );
        },
    },
    // {
    //     accessorKey: "prAutoMerge",
    //     header: "Action",
    //     meta: {
    //         headerClassName: "w-28",
    //         cellClassName: "w-28",
    //     },
    //     cell: ({ row }) => {
    //         return (
    //             <Link className="text-gray-400" href={generatePath(ROUTE_CONSTANTS.APP_PULL_REQUESTS_ISSUES, { id: row.original._id || "" })}>
    //                 <ArrowRight className="w-4 h-4 " />
    //             </Link>
    //         );
    //     },
    // }
];
