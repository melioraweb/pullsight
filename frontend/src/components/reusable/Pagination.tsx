import { Button } from "@/components/ui/button";
import {
    Pagination as PaginationComponent,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
} from "@/components/ui/pagination";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";

type PaginationProps = {
    className?: string;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

const maxDisplayed = 5;

const Pagination = ({
    className,
    currentPage,
    totalPages,
    onPageChange,
}: PaginationProps) => {
    if (totalPages <= 1) return null;

    const goToPage = (page: number) => {
        if (page !== currentPage && page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    const generatePages = () => {
        const pages: (number | "...")[] = [];

        if (totalPages <= maxDisplayed) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);

        pages.push(1);

        if (startPage > 2) pages.push("...");

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < totalPages - 1) pages.push("...");

        pages.push(totalPages);

        return pages;
    };

    return (
        <PaginationComponent className={className} aria-label="Pagination">
            <PaginationContent>
                {totalPages > maxDisplayed && (
                    <PaginationItem>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(1)}
                            disabled={currentPage === 1}
                            title="First Page"
                            aria-label="First Page"
                        >
                            <ChevronsLeft />
                        </Button>
                    </PaginationItem>
                )}

                {/* Previous */}
                <PaginationItem>
                    <Button
                        onClick={() => goToPage(currentPage - 1)}
                        aria-disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        title="Previous Page"
                        aria-label="Previous Page"
                    >
                        <ChevronLeft />
                    </Button>
                </PaginationItem>

                {/* Page Numbers with ellipsis */}
                {generatePages().map((page, index) => (
                    <PaginationItem key={index}>
                        {page === "..." ? (
                            <PaginationEllipsis />
                        ) : (
                            <Button
                                variant={
                                    page === currentPage ? "default" : "outline"
                                }
                                onClick={() => goToPage(page)}
                                size="sm"
                            >
                                {page}
                            </Button>
                        )}
                    </PaginationItem>
                ))}

                {/* Next */}
                <PaginationItem>
                    <Button
                        onClick={() => goToPage(currentPage + 1)}
                        aria-disabled={currentPage === totalPages}
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        title="Next Page"
                        aria-label="Next Page"
                    >
                        <ChevronRight />
                    </Button>
                </PaginationItem>

                {totalPages > maxDisplayed && (
                    <PaginationItem>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(totalPages)}
                            disabled={currentPage === totalPages}
                            title="Last Page"
                            aria-label="Last Page"
                        >
                            <ChevronsRight />
                        </Button>
                    </PaginationItem>
                )}
            </PaginationContent>
        </PaginationComponent>
    );
};

export default Pagination;
