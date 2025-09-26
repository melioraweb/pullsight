"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/reusable/Button";
import ContentCard from "@/components/reusable/ContentCard";
import IssuesTable from "@/components/shared/IssuesTable";

const PullRequestIssuesPage = () => {
    const params = useParams();
    const router = useRouter();
    const pullRequestId = params.id as string;

    const handleBackClick = () => {
        router.back();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    className=""
                    onClick={handleBackClick}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Pull Request Issues</h1>
                    {/* <p className="text-gray-400">Issues found in pull request #{pullRequestId}</p> */}
                </div>
            </div>

            {/* Issues Table */}
            <ContentCard>
                <ContentCard.Body className="flex flex-col flex-1">
                    <IssuesTable 
                        pullRequest={pullRequestId}
                        showSeverityTabs={true}
                        showAuthorFilter={false}
                        showPrStatusFilter={false}
                        showPrDetailsBox={true}
                        showPrColumn={false}
                    />
                </ContentCard.Body>
            </ContentCard>
        </div>
    );
};

export default PullRequestIssuesPage;
