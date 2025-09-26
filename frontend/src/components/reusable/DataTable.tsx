"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    Row,
    useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useRef, useState } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ActionDropdownProps<TData> {
    row: Row<TData>;
}

interface DataTableProps<TData> {
    className?: string;
    isLoading?: boolean;
    columns: ColumnDef<TData>[];
    data: TData[];
    noBorder?: boolean;
    onSelectionChange?: (selectedRows: TData[]) => void;
    initialSelection?: (row: TData) => boolean;
    columnFilters?: { id: string; value: unknown }[];
    onColumnFiltersChange?: (filters: { id: string; value: unknown }[]) => void;
    onRowClick?: (row: TData) => void;
}

const DataTable = <TData,>({
    className,
    isLoading,
    columns,
    data,
    noBorder = true,
    onSelectionChange,
    initialSelection,
    columnFilters,
    onColumnFiltersChange,
    onRowClick,
}: DataTableProps<TData>) => {
    const [internalColumnFilters, setInternalColumnFilters] = useState<
        { id: string; value: unknown }[]
    >([]);
    const [rowSelection, setRowSelection] = useState({});
    const prevDataLength = useRef<number>(0);

    const filters = columnFilters ?? internalColumnFilters;

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        columnResizeMode: "onChange",
        state: {
            rowSelection,
            columnFilters: filters,
        },
        onColumnFiltersChange: (updaterOrValue) => {
            // updaterOrValue can be a value or a function
            const nextFilters =
                typeof updaterOrValue === "function"
                    ? updaterOrValue(columnFilters || [])
                    : updaterOrValue;
            // Always pass an array
            if (onColumnFiltersChange) {
                onColumnFiltersChange(
                    Array.isArray(nextFilters) ? nextFilters : []
                );
            } else {
                setInternalColumnFilters(
                    Array.isArray(nextFilters) ? nextFilters : []
                );
            }
        },
        enableRowSelection: true,
        enableFilters: true,
    });

    // Set initial selection based on initialSelection function
    useEffect(() => {
        if (
            initialSelection &&
            data.length > 0 &&
            data.length !== prevDataLength.current
        ) {
            const initialSelectionState: Record<string, boolean> = {};
            data.forEach((row, index) => {
                if (initialSelection(row)) {
                    initialSelectionState[index.toString()] = true;
                }
            });
            setRowSelection(initialSelectionState);
            prevDataLength.current = data.length;
        }
    }, [data, initialSelection]);

    // Call the callback whenever selection changes
    useEffect(() => {
        if (onSelectionChange) {
            const selectedRows = table
                .getFilteredSelectedRowModel()
                .rows.map((row) => row.original);
            onSelectionChange(selectedRows);
        }
    }, [rowSelection, onSelectionChange, table]);

    return (
        <div
            className={cn(
                `rounded-md border relative overflow-hidden`,
                noBorder && "border-0",
                className
            )}
        >
            <div className="overflow-x-auto">
                <Table className="w-full min-w-max">
                    <TableHeader
                        className={cn(
                            "bg-card",
                            noBorder && "[&_tr]:border-b-0"
                        )}
                    >
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const meta = header.column.columnDef
                                        .meta as any;
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={cn(
                                                "px-3 sm:px-5 py-3 text-muted text-xs whitespace-nowrap",
                                                meta?.headerClassName
                                            )}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className={cn(
                                        "",
                                        noBorder && "border-0",
                                        onRowClick && "cursor-pointer hover:bg-white/5 transition-colors"
                                    )}
                                    onClick={() => onRowClick?.(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        const meta = cell.column.columnDef
                                            .meta as any;
                                        return (
                                            <TableCell
                                                key={cell.id}
                                                className={cn(
                                                    "px-3 sm:px-5 py-3",
                                                    meta?.cellClassName
                                                )}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark/50 backdrop-blur-sm">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            )}
        </div>
    );
};

export default DataTable;
