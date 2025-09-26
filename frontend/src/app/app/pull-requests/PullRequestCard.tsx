"use client";

import { PullRequest } from "@/types/pullRequest";
import { Card, CardContent } from "@/components/ui/card";
import Avatar from "../../../components/reusable/Avatar";
import Badge from "../../../components/reusable/Badge";
import { formatDate } from "@/lib/dayjs";
import { ExternalLink, GitPullRequest } from "lucide-react";
import Button from "@/components/reusable/Button";
import Link from "next/link";
import { generatePath } from "@/lib/utils";
import { ROUTE_CONSTANTS } from "@/lib/constants";

interface PullRequestCardProps {
    pullRequest: PullRequest;
    onClick?: (pullRequest: PullRequest) => void;
}

const PullRequestCard = ({ pullRequest, onClick }: PullRequestCardProps) => {
    
    const totalInputTokens = pullRequest?.pullRequestAnalysis?.reduce((acc, curr) => acc + (curr?.usageInfo?.input_tokens || 0) + (curr?.prReviewUsageInfo?.input_tokens || 0), 0) || 0;
    const totalOutputTokens = pullRequest?.pullRequestAnalysis?.reduce((acc, curr) => acc + (curr?.usageInfo?.output_tokens || 0) + (curr?.prReviewUsageInfo?.output_tokens || 0), 0) || 0;

    return (
        <Card 
            className="p-4 hover:bg-card/80 transition-colors cursor-pointer"
            onClick={() => onClick?.(pullRequest)}
        >
            <CardContent className="p-0">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <GitPullRequest className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs text-muted-foreground">
                                #{pullRequest.prNumber}
                            </span>
                        </div>
                        <h3 className="text-white font-medium leading-tight mb-2 line-clamp-2">
                            {pullRequest.prTitle}
                        </h3>
                        <div className="text-xs text-muted-foreground mb-2">
                            {pullRequest.repo}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                            <Avatar
                                src={pullRequest.prUserAvatar || ""}
                                name={pullRequest.prUser || "Unknown"}
                                size="sm"
                                className="flex-shrink-0"
                            />
                            <span>•</span>
                            <span className="whitespace-nowrap">
                                {formatDate(pullRequest.prUpdatedAt)}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-3">
                        <Badge
                            variant={
                                pullRequest.prState === "merged" ||
                                pullRequest.prState === "closed"
                                    ? "success"
                                    : pullRequest.prState === "rejected"
                                    ? "destructive"
                                    : "default"
                            }
                            type="faded"
                            className="text-xs"
                        >
                            {pullRequest.prState}
                        </Badge>
                        <a
                            href={pullRequest.prUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-white transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>
                <div className="mb-3">
                    <div className="flex gap-1 items-center">
                        <span className="text-gray-400 text-xs w-26">Input tokens:</span>
                        <span className="font-semibold">
                            {(totalInputTokens || 0).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex gap-1 items-center">
                        <span className="text-gray-400 text-xs w-26">Output tokens:</span>
                        <span className="font-semibold">
                            {(totalOutputTokens || 0).toLocaleString()}
                        </span>
                    </div>
                </div>                
                <Link href={generatePath(ROUTE_CONSTANTS.APP_PULL_REQUESTS_ISSUES, { id: pullRequest._id || "" })}>
                    <Button variant={'outline'}>
                        View Issues
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
};

export default PullRequestCard;
