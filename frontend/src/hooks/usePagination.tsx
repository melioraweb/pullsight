import Pagination from "@/components/reusable/Pagination";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface UsePaginationOptions {
    totalPages: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
}

interface PaginationProps {
    className?: string;
}

const usePagination = ({
    totalPages,
    currentPage: externalCurrentPage,
    onPageChange: externalOnPageChange,
}: UsePaginationOptions) => {
    const [internalCurrentPage, setInternalCurrentPage] = useState(1);

    // Use external currentPage if provided, otherwise use internal
    const currentPage = externalCurrentPage ?? internalCurrentPage;

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            if (externalOnPageChange) {
                externalOnPageChange(page);
            } else {
                setInternalCurrentPage(page);
            }
        }
    };

    const PaginationComponent = ({ className }: PaginationProps) => {
        return (
            <Pagination
                className={cn("mt-4", className)}
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={goToPage}
            />
        );
    };

    return {
        currentPage,
        setCurrentPage: goToPage,
        Pagination: PaginationComponent,
    };
};

export default usePagination;
