import { Skeleton } from "@/components/ui/skeleton";
import ContentCard from "@/components/reusable/ContentCard";

export default function Loading() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-48" />
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>

            {/* Issues Table Skeleton */}
            <ContentCard>
                <ContentCard.Header className="flex-wrap sm:flex-nowrap gap-y-4 min-h-[61px]">
                    <Skeleton className="h-6 w-48" />
                </ContentCard.Header>
                <ContentCard.Body className="flex flex-col flex-1">
                    {/* Filter tabs skeleton */}
                    <div className="flex flex-wrap md:flex-nowrap items-center gap-x-6 gap-y-2 mb-6">
                        <div className="flex gap-2">
                            {[...Array(6)].map((_, i) => (
                                <Skeleton key={i} className="h-8 w-20" />
                            ))}
                        </div>
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-8 w-32" />
                    </div>
                    
                    {/* Table skeleton */}
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 border border-gray-800 rounded-lg">
                                <Skeleton className="h-4 flex-1" />
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ))}
                    </div>
                </ContentCard.Body>
            </ContentCard>
        </div>
    );
}
