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
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnimatePresence, motion } from 'framer-motion';

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
              Copy full text to clipboard
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 53,
  },
  {
    accessorKey: 'time',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="w-full justify-center"
        >
          Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const time: string = row.getValue('time');
      return <div className="w-30 whitespace-nowrap">{time}</div>;
    },
    filterFn: 'includesString',
    size: 176,
  },
  {
    accessorKey: 'url',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="w-full justify-center"
        >
          URL
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const url: string = row.getValue('url');
      return (
        <div className="w-64 overflow-hidden text-ellipsis whitespace-nowrap">
          <a
            className="cursor-pointer text-blue-500 hover:underline"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {url}
          </a>
        </div>
      );
    },
    size: 300,
    filterFn: 'includesString',
  },
  {
    accessorKey: 'full_text',
    header: () => <div className="text-center">Full text</div>,
    cell: ({ row, table }) => {
      const text: string = row.getValue('full_text');
      const searchTerm = table.getState().globalFilter || '';
      const isExpanded = row.getIsExpanded();

      if (!text) {
        return (
          <div className="italic text-gray-500">No full text available.</div>
        );
      }

      const truncatedText = text.slice(0, 45) + (text.length > 45 ? '...' : '');

      return (
        <div className="max-w-2xl">
          <AnimatePresence initial={false}>
            {isExpanded ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ScrollArea className="h-[300px] max-w-[430px] rounded-md border p-2">
                  {text.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-2">
                      <HighlightedText
                        text={paragraph}
                        highlight={searchTerm}
                      />
                    </p>
                  ))}
                </ScrollArea>
                <div className="mr-4 flex justify-end">
                  <button
                    onClick={() => row.toggleExpanded()}
                    className="mt-2 cursor-pointer text-blue-500 hover:underline"
                  >
                    Show less
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mr-4 flex justify-between">
                  <HighlightedText
                    text={truncatedText}
                    highlight={searchTerm}
                  />
                  {text.length > 45 && (
                    <button
                      onClick={() => row.toggleExpanded()}
                      className="ml-2 cursor-pointer text-blue-500 hover:underline"
                    >
                      Show more
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    },
    size: 470,
    filterFn: 'includesString',
  },
];
