"use client";
import * as React from 'react';

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getExpandedRowModel,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from './button';
import { Label } from '@radix-ui/react-label';
import { Skeleton } from './skeleton';
import { Input } from './input';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onDeleteSelected?: (selectedRows: TData[]) => void;
  tableName: string;
  isLoading?: boolean;
  reducedSpacing?: boolean;
  showGlobalFilter?: boolean;
  onClear?: number;
  hideTitle?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onDeleteSelected,
  tableName,
  isLoading = false,
  reducedSpacing = false,
  showGlobalFilter = true,
  onClear,
  hideTitle = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

  React.useEffect(() => {
    if (onClear !== undefined) {
      table.toggleAllRowsExpanded(false);
    }
  }, [onClear, table]);

  const handleDeleteSelected = () => {
    if (onDeleteSelected) {
      const selectedRows = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);
      onDeleteSelected(selectedRows);
      table.toggleAllRowsSelected(false);
    }
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <>
          {[...Array(8)].map((_, index) => (
            <TableRow key={index}>
              {columns.map((_column, cellIndex) => (
                <TableCell key={cellIndex}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </>
      );
    }

    if (table.getRowModel().rows?.length) {
      return table.getRowModel().rows.map((row) => (
        <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="text-center">
          No items to display.
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div>
      {!hideTitle && (
        <div className={`flex h-8 items-center justify-between ${reducedSpacing ? 'mb-2' : 'mb-4'}`}>
          <Label className="text-base font-medium">{tableName}</Label>
        </div>
      )}
      {showGlobalFilter && table.getAllColumns().some(column => column.getCanFilter()) && (
        <div className={`flex items-center ${reducedSpacing ? 'py-2' : 'py-4'}`}>
          <Input
            placeholder="Quick filter visible results..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      <div className="mb-4 rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>{renderTableContent()}</TableBody>
        </Table>
      </div>
      {(table.getCanPreviousPage() || table.getCanNextPage() || (onDeleteSelected && table.getSelectedRowModel().rows.length > 0)) && (
        <div className="flex items-center justify-between mt-4">
          <div>
            {onDeleteSelected && table.getSelectedRowModel().rows.length > 0 && (
              <Button onClick={handleDeleteSelected} variant="destructive" size="sm">
                Delete Selected
              </Button>
            )}
          </div>
          {(table.getCanPreviousPage() || table.getCanNextPage()) && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
