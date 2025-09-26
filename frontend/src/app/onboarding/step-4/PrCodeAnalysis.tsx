import type React from "react";
import { FC, useState } from "react";

import {
    AlertTriangle,
    Info,
    AlertCircle,
    GitPullRequest,
    GitMerge,
    ExternalLink,
    Loader,
} from "lucide-react";
import { PRAnalysisData } from "@/types/prAnalysis";
import { humanizeDate } from "@/lib/dayjs";
import { Button } from "@/components/ui/button";
import { PullRequest } from "@/types/pullRequest";
import Avatar from "@/components/reusable/Avatar";
import MdPreview from "@/components/reusable/MdPreview";
import Image from "next/image";
import Badge from "@/components/reusable/Badge";
import { cn } from "@/lib/utils";

interface Props {
    analysisData: PRAnalysisData;
    pullRequest: PullRequest;
}

const PrCodeAnalysis: FC<Props> = ({ analysisData, pullRequest }) => {
    const [showAllComments, setShowAllComments] = useState(true);

    const analysis = analysisData;
    const pr = pullRequest;

    // Filter out any null comments to prevent crashes
    const validComments = analysis.comments
        ? analysis.comments.filter(Boolean)
        : [];

    const getSeverityClassname = (severity: string) => {
        switch (severity) {
            case "blocker":
                return "bg-red-900/30 text-red-300 border-red-700";
            case "critical":
                return "bg-orange-900/30 text-orange-300 border-orange-700";
            case "major":
                return "bg-yellow-900/30 text-yellow-300 border-yellow-700";
            case "minor":
                return "bg-blue-900/30 text-blue-300 border-blue-700";
            case "info":
                return "bg-green-900/30 text-green-300 border-green-700";
            default:
                return "bg-yellow-900/30 text-yellow-300 border-yellow-700";
        }
    };

    const displayedComments = showAllComments
        ? validComments
        : validComments.slice(0, 3);

    return (
        <div className="rounded-xl text-gray-100 font-sans space-y-3">
            {/* PR Header */}
            <div className="bg-[var(--box-800)] rounded-xl p-4">
                <div className="flex flex-col lg:flex-row items-start gap-3">
                    <Avatar
                        src={pr?.prUserAvatar || ""}
                        name={pr?.prUser || ""}
                        hideDetails
                    />

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-200">
                                {pr?.prUser}
                            </span>
                            <Badge className="bg-purple-900/30 text-purple-300 border-purple-700">
                                {pr?.prState == "merged" ? (
                                    <GitMerge className="w-3 h-3 mr-1" />
                                ) : (
                                    <GitPullRequest className="w-3 h-3 mr-1" />
                                )}
                                PR #{pr?.prNumber} • {pr?.prState}
                            </Badge>
                            <span className="text-gray-400 text-sm">
                                {humanizeDate(pr?.prCreatedAt || "")}
                            </span>
                            <a
                                href={pr?.prUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cursor-pointer text-gray-400 hover:text-gray-200"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-200 mb-2">
                            {pr?.prTitle || "Untitled PR"}
                        </h3>

                        {/* <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="text-green-400">
                                +{pr?.prAdditions}
                            </span>
                            <span className="text-red-400">
                                -{pr?.prDeletions}
                            </span>
                            <span>
                                {pr?.prFilesChanged} file
                                {pr?.prFilesChanged !== 1 ? "s" : ""} changed
                            </span>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* AI Analysis Summary */}
            <div className="bg-[var(--box-800)] rounded-xl p-4">
                <div className="flex flex-col lg:flex-row items-start gap-3">
                    <div className="w-12 h-12 flex-shrink-0 rounded-full  flex items-center justify-center">
                        <Image
                            src="/images/logo-icon.svg"
                            alt="pull sight logo"
                            width={26}
                            height={42}
                            className="flex-shrink-0"
                        />
                    </div>

                    <div className="flex-1 max-w-full">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-200">
                                PullSight AI
                            </span>
                            <Badge className="bg-blue-900/30 text-blue-300 border-blue-700">
                                Code Analysis{" "}
                                {analysis.status == "inprogress"
                                    ? "In Progress..."
                                    : "Complete"}
                            </Badge>
                        </div>

                        <div className="text-gray-300 text-sm mb-3">
                            {analysis.status == "inprogress" ? (
                                <div className="p-5 flex items-center justify-center">
                                    <Loader className="animate-spin" />
                                </div>
                            ) : (
                                <MdPreview content={analysis.summary} />
                            )}
                        </div>

                        <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 text-xs text-gray-400 divide-x divide-gray-700">
                            <span className="flex items-center gap-1 pr-4">
                                <span className="mr-[2px]">⛔</span>
                                {
                                    validComments.filter(
                                        (c) =>
                                            c.severity.toLocaleLowerCase() ===
                                            "blocker"
                                    ).length
                                }{" "}
                                <span className="">Blocker</span>
                            </span>
                            <span className="flex items-center gap-1 pr-4">
                                <span className="mr-[2px]">🛑</span>
                                {
                                    validComments.filter(
                                        (c) =>
                                            c.severity.toLocaleLowerCase() ===
                                            "critical"
                                    ).length
                                }{" "}
                                <span className="">Critical</span>
                            </span>
                            <span className="flex items-center gap-1 pr-4">
                                <span className="mr-[2px]">❗</span>
                                {
                                    validComments.filter(
                                        (c) =>
                                            c.severity.toLocaleLowerCase() ===
                                            "major"
                                    ).length
                                }{" "}
                                <span className="">Major</span>
                            </span>
                            <span className="flex items-center gap-1 pr-4">
                                <span className="mr-[2px]">⚠️</span>
                                {
                                    validComments.filter(
                                        (c) =>
                                            c.severity.toLocaleLowerCase() ===
                                            "minor"
                                    ).length
                                }{" "}
                                <span className="">Minor</span>
                            </span>
                            <span className="flex items-center gap-1 pr-4">
                                <span className="mr-[2px]">ℹ️</span>
                                {
                                    validComments.filter(
                                        (c) =>
                                            c.severity.toLocaleLowerCase() ===
                                            "info"
                                    ).length
                                }{" "}
                                <span className="">Info</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Comments */}

            {displayedComments.map((comment, index) => (
                <div key={index} className="bg-[var(--box-800)] rounded-xl p-4">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <Image
                            src="/images/logo-icon.svg"
                            alt="pull sight logo"
                            width={26}
                            height={42}
                            className="flex-shrink-0"
                        />
                        <div className="flex-1 max-w-full space-y-1">
                            <div className="flex flex-col lg:flex-row gap-y-2">
                                <Badge
                                    type="faded"
                                    className={cn(
                                        "mr-2",
                                        getSeverityClassname(
                                            comment.severity?.toLowerCase()
                                        )
                                    )}
                                >
                                    Severity:{" "}
                                    <span className="capitalize">
                                        {comment.severity}
                                    </span>
                                </Badge>
                                <span className="text-gray-400 text-sm break-words">
                                    {comment.filePath}:{comment.lineStart}
                                    {comment.lineEnd !== comment.lineStart &&
                                        `-${comment.lineEnd}`}
                                </span>
                            </div>
                            <div className="font-medium">
                                {comment.category}
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-xl p-4 border-gray-700">
                        {comment.codeSnippet && (
                            <div className="bg-gray-950 rounded border border-gray-700 p-3 mb-3">
                                <pre className="text-xs overflow-x-auto">
                                    {comment.codeSnippet
                                        .trim()
                                        .split("\n")
                                        .map((line, index) => {
                                            const lineNumber =
                                                (comment.codeSnippetLineStart ??
                                                    comment.lineStart) + index;
                                            const isHighlighted =
                                                lineNumber >=
                                                    comment.lineStart &&
                                                lineNumber <= comment.lineEnd;

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
                                                                ? comment.severity ===
                                                                  "critical"
                                                                    ? "bg-red-900/40 text-red-200 border-l-2 border-red-500"
                                                                    : comment.severity ===
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
                        <div className="text-gray-300 text-sm mb-3">
                            <MdPreview content={comment.content} />
                        </div>
                    </div>
                </div>
            ))}
            {analysis.status == "inprogress" && (
                <div className="p-5">
                    <p className="text-gray-400">Analysis in progress...</p>
                </div>
            )}

            {/* Show More Button */}
            {analysis.comments.length > 3 && (
                <div className="border-b border-gray-700 p-4 text-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllComments(!showAllComments)}
                        className="text-gray-400 hover:text-gray-200"
                    >
                        {showAllComments
                            ? `Show less (${
                                  analysis.comments.length - 3
                              } hidden)`
                            : `Show ${
                                  analysis.comments.length - 3
                              } more comments`}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default PrCodeAnalysis;
