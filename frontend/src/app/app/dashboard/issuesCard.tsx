import ContentCard from "@/components/reusable/ContentCard";
import IssuesTable from "@/components/shared/IssuesTable";
import { cn } from "@/lib/utils";

interface Props {
    className?: string;
    fromDate?: string;
    toDate?: string;
    repo?: string | null;
}

const IssuesCard = ({ className, fromDate, toDate, repo }: Props) => {
    return (
        <ContentCard className={cn(``, className)}>
            <ContentCard.Header className="flex-wrap sm:flex-nowrap gap-y-4 min-h-[61px]">
                <h3 className="text-muted font-semibold">Issues</h3>
            </ContentCard.Header>
            <ContentCard.Body className="flex flex-col flex-1">
                <IssuesTable 
                    fromDate={fromDate}
                    toDate={toDate}
                    repo={repo}
                    showSeverityTabs={true}
                    showAuthorFilter={true}
                    showPrStatusFilter={true}
                />
            </ContentCard.Body>
        </ContentCard>
    );
};

export default IssuesCard;
