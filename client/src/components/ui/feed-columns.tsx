'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Feed = {
  url: string;
};

export const feedColumns: ColumnDef<Feed>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value: unknown) =>
          table.toggleAllPageRowsSelected(!!value)
        }
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: unknown) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
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
];
