'use client';
import * as React from 'react';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@radix-ui/react-label';
import { Skeleton } from './skeleton';
import { Button } from './button';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onDeleteSelected?: (selectedRows: TData[]) => void;
  tableName: string;
  isLoading?: boolean;
  reducedSpacing?: boolean;
  onClear?: number;
  hideTitle?: boolean;
  showDeleteButton?: boolean;
  totalCount?: number;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
  showPageNumbers?: boolean;
  onSort?: (column: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onDeleteSelected,
  tableName,
  isLoading = false,
  reducedSpacing = false,
  onClear,
  hideTitle = false,
  showDeleteButton = false,
  totalCount,
  currentPage,
  itemsPerPage,
  onPageChange,
  showPagination = false,
  showPageNumbers = false,
  onSort,
  sortBy,
  sortOrder,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualSorting: true,
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
          {[...Array(itemsPerPage || 5)].map((_, index) => (
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

    if (data.length) {
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
          {totalCount !== undefined && (
            <span className="text-sm text-gray-500">
              Total items: {totalCount}
            </span>
          )}
        </div>
      )}

      <div className="mb-4 rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id} 
                    colSpan={header.colSpan}
                    onClick={() => onSort && onSort(header.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {sortBy === header.id && (
                      <span>{sortOrder === 'asc' ? '' : ''}</span>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>{renderTableContent()}</TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        {showPagination && currentPage !== undefined && onPageChange && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={totalCount !== undefined && itemsPerPage !== undefined && currentPage * itemsPerPage >= totalCount}
            >
              Next
            </Button>
            {showPageNumbers && (
              <span className="text-sm ml-2">
                Page {currentPage} of {totalCount !== undefined && itemsPerPage !== undefined ? Math.ceil(totalCount / itemsPerPage) : ''}
              </span>
            )}
          </div>
        )}
        {showDeleteButton && onDeleteSelected && table.getSelectedRowModel().rows.length > 0 && (
          <Button
            onClick={handleDeleteSelected}
            variant="destructive"
            size="sm"
            className="ml-auto"
          >
            Delete Selected
          </Button>
        )}
      </div>
    </div>
  );
}
