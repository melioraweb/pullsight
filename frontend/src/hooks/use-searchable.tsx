import { cn } from "@/lib/utils";
import { useMemo, useState, ChangeEvent, InputHTMLAttributes } from "react";

type UseSearchableOptions<T> = {
    data: T[];
    searchFn?: (item: T, keyword: string) => boolean;
    initialKeyword?: string;
    inputProps?: InputHTMLAttributes<HTMLInputElement>;
};

export function useSearchable<T>({
    data,
    searchFn,
    initialKeyword = "",
    inputProps = {},
}: UseSearchableOptions<T>) {
    const [keyword, setKeyword] = useState(initialKeyword);

    // Default search: checks if any string field includes the keyword (case-insensitive)
    const defaultSearchFn = (item: T, kw: string) => {
        if (!kw) return true;
        const lower = kw.toLowerCase();
        return Object.values(item as Record<string, unknown>).some(
            (v) => typeof v === "string" && v.toLowerCase().includes(lower)
        );
    };

    const filterFn = searchFn || defaultSearchFn;

    const filteredData = useMemo(
        () => data.filter((item) => filterFn(item, keyword)),
        [data, filterFn, keyword]
    );

    const searchInput = (
        <input
            type="text"
            value={keyword}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setKeyword(e.target.value)
            }
            placeholder="Search..."
            {...inputProps}
            className={cn(
                "border rounded-md p-2 text-sm ",
                inputProps.className
            )}
        />
    );

    return { filteredData, keyword, setKeyword, searchInput };
}
