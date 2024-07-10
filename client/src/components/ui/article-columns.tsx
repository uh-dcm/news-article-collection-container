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
import { useMemo, useState } from 'react';

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
  },
  {
    accessorKey: 'full_text',
    header: 'Full text',
    cell: ({ row, table }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [showFullText, setShowFullText] = useState(false);
      const text: string = row.getValue('full_text');
      const searchTerm =
        (table.getColumn('full_text')?.getFilterValue() as string) || '';

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const formattedText = useMemo(() => {
        const truncatedText =
          text.slice(0, 50) + (text.length > 50 ? '...' : '');
        return showFullText ? text : truncatedText;
      }, [text, showFullText]);

      const handleToggle = () => {
        setShowFullText(!showFullText);
      };
      return (
        <div>
          <div>
            <HighlightedText text={formattedText} highlight={searchTerm} />
          </div>
          <a onClick={handleToggle}>
            <p className="cursor-pointer text-blue-500 hover:underline">
              {showFullText ? 'Show less' : 'Show more...'}
            </p>
          </a>
        </div>
      );
    },
  },
];
