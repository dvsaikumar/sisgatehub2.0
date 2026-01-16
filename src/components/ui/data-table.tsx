import * as React from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';

/**
 * DataTable Component
 * 
 * Per God Mode Protocol:
 * - Reusable, generic table component
 * - Built-in pagination, sorting, filtering
 * - Column visibility toggles
 * - Row selection support
 */

// ============================================
// TYPES
// ============================================

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    searchPlaceholder?: string;
    pageSize?: number;
    showPagination?: boolean;
    showRowSelection?: boolean;
    onRowClick?: (row: TData) => void;
    isLoading?: boolean;
    emptyMessage?: string;
}

// ============================================
// COMPONENT
// ============================================

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = 'Search...',
    pageSize = 10,
    showPagination = true,
    showRowSelection = false,
    onRowClick,
    isLoading = false,
    emptyMessage = 'No results found.',
}: DataTableProps<TData, TValue>) {
    // State
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize,
    });

    // Table instance
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
            pagination,
        },
        enableRowSelection: showRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="w-full space-y-4">
            {/* Search Bar */}
            {searchKey && (
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="max-w-sm h-10 px-3 rounded-lg border border-border bg-surface-secondary text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                    />
                </div>
            )}

            {/* Table */}
            <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-surface-secondary border-b border-border">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className={cn(
                                            'h-12 px-4 text-left align-middle font-medium text-text-muted',
                                            header.column.getCanSort() && 'cursor-pointer select-none hover:text-text-primary'
                                        )}
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center gap-2">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getIsSorted() === 'asc' && (
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M7 14l5-5 5 5H7z" />
                                                </svg>
                                            )}
                                            {header.column.getIsSorted() === 'desc' && (
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M7 10l5 5 5-5H7z" />
                                                </svg>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="bg-surface-primary">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-primary-500" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span className="text-text-muted">Loading...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className={cn(
                                        'border-b border-border last:border-0 transition-colors',
                                        onRowClick && 'cursor-pointer hover:bg-surface-secondary',
                                        row.getIsSelected() && 'bg-primary-500/10'
                                    )}
                                    onClick={() => onRowClick?.(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-4 py-3 align-middle text-text-primary">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="h-24 text-center text-text-muted">
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {showPagination && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-text-muted">
                        {table.getFilteredSelectedRowModel().rows.length > 0 && (
                            <span>{table.getFilteredSelectedRowModel().rows.length} of{' '}</span>
                        )}
                        {table.getFilteredRowModel().rows.length} row(s)
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="px-3 py-1.5 text-sm rounded-md border border-border bg-surface-secondary text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-primary transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-text-muted">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </span>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="px-3 py-1.5 text-sm rounded-md border border-border bg-surface-secondary text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-primary transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Re-export types for consumers
export type { ColumnDef };
