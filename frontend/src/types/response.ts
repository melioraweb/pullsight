export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data?: T;
}

interface Paginated<T> {
    docs: T[];
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
}

export interface PaginatedResponse<T> extends ApiResponse<Paginated<T>> {
    data: Paginated<T>;
}
