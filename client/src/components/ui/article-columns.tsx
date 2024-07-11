'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Button } from './button';
import { HighlightedText } from './highlighted-text';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Article = {
  time: string;
  url: string;
  full_text: string;
};

export const articleColumns: ColumnDef<Article>[] = [
  {
    id: 'actions',
    cell: ({ row }) => {
      const article = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(article.url)}
            >
              Copy URL to clipboard
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(article.full_text)}
            >
              Copy Full text to clipboard
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: 'time',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    filterFn: 'includesString',
  },
  {
    accessorKey: 'url',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          URL
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const url: string = row.getValue('url');
      return (
        <a
          className="cursor-pointer text-blue-500 hover:underline"
          href={url}
          target="_blank"
        >
          {url}
        </a>
      );
    },
    filterFn: 'includesString',
  },
  {
    accessorKey: 'full_text',
    header: 'Full text',
    cell: ({ row, table }) => {
      const text: string = row.getValue('full_text');
      const searchTerm = table.getState().globalFilter || '';
      const isExpanded = row.getIsExpanded();

      const truncatedText = text.slice(0, 50) + (text.length > 50 ? '...' : '');

      return (
        <div>
          {isExpanded ? (
            <div className="flex flex-col">
              <HighlightedText text={text} highlight={searchTerm} />
              <button
                onClick={() => row.toggleExpanded()}
                className="mt-2 self-start cursor-pointer text-blue-500 hover:underline"
              >
                Show less
              </button>
            </div>
          ) : (
            <div>
              <HighlightedText text={truncatedText} highlight={searchTerm} />
              {text.length > 50 && (
                <button
                  onClick={() => row.toggleExpanded()}
                  className="ml-2 cursor-pointer text-blue-500 hover:underline"
                >
                  Show more...
                </button>
              )}
            </div>
          )}
        </div>
      );
    },
    filterFn: 'includesString',
  },
];
