'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Button } from './button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

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
    header: 'URL',
    cell: ({ row }) => {
      const url: string = row.getValue('url');
      return (
        <a className="hover:underline" href={url} target="_blank">
          {url}
        </a>
      );
    },
  },
  {
    accessorKey: 'full_text',
    header: 'Full text',
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [showFullText, setShowFullText] = useState(false);
      const text: string = row.getValue('full_text');
      const format = text.slice(0, 50) + '';
      const handleToggle = () => {
        setShowFullText(!showFullText);
      };
      return (
        <div>
          <div>{!showFullText ? format : text}</div>
          <a onClick={handleToggle}>
            {!showFullText ? (
              <p className="cursor-pointer text-blue-500 hover:underline">
                Show more...
              </p>
            ) : (
              <p className="cursor-pointer text-blue-500 hover:underline">
                Show less
              </p>
            )}
          </a>
        </div>
      );
    },
  },
];
