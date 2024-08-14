import { ArrowDownTrayIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface DownloadButtonProps {
  onDownload: (format: 'json' | 'csv' | 'parquet') => void;
  isDisabled: boolean;
  buttonText: string;
  className?: string;
}

export function DownloadButton({ onDownload, isDisabled, buttonText, className }: DownloadButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`px-3 ${className}`} disabled={isDisabled}>
          <ArrowDownTrayIcon className="mr-2 h-5 w-5" />
          {buttonText}
          <ChevronDownIcon className="ml-2 h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {['JSON', 'CSV', 'Parquet'].map((format) => (
          <DropdownMenuItem 
            key={format.toLowerCase()} 
            onClick={() => onDownload(format.toLowerCase() as 'json' | 'csv' | 'parquet')}
          >
            {format}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
