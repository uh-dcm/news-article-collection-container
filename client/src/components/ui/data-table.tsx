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

import { Skeleton } from './skeleton';
import { Button } from './button';

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';

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
  isLoading = false,
  onClear,
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

  const handleLastPage = () => {
    if (
      totalCount !== undefined &&
      itemsPerPage !== undefined &&
      onPageChange
    ) {
      onPageChange(Math.ceil(totalCount / itemsPerPage));
    }
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <>
          {[...Array(itemsPerPage || 5)].map((_, index) => (
            <TableRow key={index}>
              {columns.map((column, cellIndex) => (
                <TableCell width={column.size} key={cellIndex}>
                  <Skeleton className="h-8 w-full" />
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
      <div className="flex-grow"></div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6 lg:space-x-8">
          {showPagination && currentPage !== undefined && onPageChange && (
            <div className="flex items-center space-x-2">
              {showPageNumbers && (
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">Go to first page</span>
                  <DoubleArrowLeftIcon className="h-4 w-4" />
                </Button>
              )}

              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={
                  totalCount !== undefined &&
                  itemsPerPage !== undefined &&
                  currentPage * itemsPerPage >= totalCount
                }
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              {showPageNumbers && (
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={handleLastPage}
                  disabled={
                    totalCount !== undefined &&
                    itemsPerPage !== undefined &&
                    currentPage === Math.ceil(totalCount / itemsPerPage)
                  }
                >
                  <span className="sr-only">Go to last page</span>
                  <DoubleArrowRightIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          {showPageNumbers && (
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {currentPage} of{' '}
              {totalCount !== undefined && itemsPerPage !== undefined
                ? Math.ceil(totalCount / itemsPerPage)
                : ''}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        {showDeleteButton &&
          onDeleteSelected &&
          table.getSelectedRowModel().rows.length > 0 && (
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
