import React, { KeyboardEvent, useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DownloadButton } from '@/components/ui/download-button';
import { Separator } from '@/components/ui/separator';
import { useSearchContext } from './use-search-context';
import { toast } from 'sonner';

export interface SearchParams {
  generalQuery?: string;
  textQuery?: string;
  urlQuery?: string;
  startTime?: string;
  endTime?: string;
  htmlQuery?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

interface AdvancedSearchProps {
  searchParams: SearchParams;
  onSearchParamsChange: (params: SearchParams) => void;
  onSearch: (params: SearchParams) => void;
  onDownload: (format: 'json' | 'csv' | 'parquet') => void;
  onClear: () => void;
  isDownloadDisabled: boolean;
  resultCount: number;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  searchParams,
  onSearchParamsChange,
  onSearch,
  onDownload,
  onClear,
  isDownloadDisabled,
  resultCount,
}) => {
  const { isAdvancedOpen, setIsAdvancedOpen } = useSearchContext();
  const [isSaveSearchOpen, setIsSaveSearchOpen] = useState(false);

  const handleSearch = () => {
    console.log(searchParams);
    onSearch(searchParams);
  };

  const handleInputChange =
    (key: keyof SearchParams) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchParamsChange({ ...searchParams, [key]: e.target.value });
    };

  const handleClear = () => {
    onSearchParamsChange({
      generalQuery: '',
      textQuery: '',
      urlQuery: '',
      startTime: '',
      endTime: '',
      htmlQuery: '',
    });
    onClear();
  };

  const handleAdvancedToggle = () => {
    setIsAdvancedOpen(!isAdvancedOpen);
    if (isAdvancedOpen) {
      onSearchParamsChange({
        ...searchParams,
        textQuery: '',
        urlQuery: '',
        startTime: '',
        endTime: '',
        htmlQuery: '',
      });
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSaveSearchToggle = () => {
    setIsSaveSearchOpen(!isSaveSearchOpen);
  };

  const handleCopySearch = () => {
    toast.dismiss();
    navigator.clipboard.writeText(JSON.stringify(searchParams));
    toast.info('Query copied to clipboard!');
  };

  return (
    <Card className="w-full">
      <CardHeader className="relative">
        <CardTitle>Search articles</CardTitle>
        <CardDescription>
          Query and export articles with matching data
        </CardDescription>
        <div className="absolute right-4 top-4 flex items-center space-x-4">
          <DownloadButton
            onDownload={onDownload}
            isDisabled={isDownloadDisabled || resultCount === 0}
            buttonText="Download Results"
            className="w-[205px]"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="h-8 px-2 text-xs"
          >
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex space-x-2">
          <div className="relative flex-grow">
            <Input
              className="w-full pr-16"
              placeholder="Insert query..."
              value={searchParams.generalQuery || ''}
              onChange={handleInputChange('generalQuery')}
              onKeyDown={handleKeyDown}
              disabled={isAdvancedOpen}
            />
            <Button
              className="absolute right-0 top-0 rounded-l-none"
              onClick={handleSearch}
            >
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
          <Button variant="outline" onClick={handleAdvancedToggle}>
            Advanced
            {isAdvancedOpen ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </div>
        <AnimatePresence>
          {isAdvancedOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Separator className="my-4" />
              <div className="grid gap-4">
                <Input
                  className="w-full"
                  placeholder="Insert text query..."
                  value={searchParams.textQuery || ''}
                  onChange={handleInputChange('textQuery')}
                  onKeyDown={handleKeyDown}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    placeholder="Insert URL query..."
                    value={searchParams.urlQuery || ''}
                    onChange={handleInputChange('urlQuery')}
                    onKeyDown={handleKeyDown}
                  />
                  <Input
                    placeholder="Insert HTML query..."
                    value={searchParams.htmlQuery || ''}
                    onChange={handleInputChange('htmlQuery')}
                    onKeyDown={handleKeyDown}
                  />
                  <Input
                    placeholder="Insert start time... (YYYY-MM-DD HH:MM:SS)"
                    value={searchParams.startTime || ''}
                    onChange={handleInputChange('startTime')}
                    onKeyDown={handleKeyDown}
                  />
                  <Input
                    placeholder="Insert end time... (YYYY-MM-DD HH:MM:SS)"
                    value={searchParams.endTime || ''}
                    onChange={handleInputChange('endTime')}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleSaveSearchToggle}
                className="mt-4"
              >
                View Query Syntax
                {isSaveSearchOpen ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                )}
              </Button>

              <AnimatePresence>
                {isSaveSearchOpen && (
                  <div>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="my-4 w-1/2 rounded-md border border-gray-100 pb-1 shadow-sm">
                        <p className="whitespace-pre-wrap break-words p-2 font-mono text-sm">
                          {JSON.stringify(searchParams)}
                        </p>
                      </div>
                      <Button onClick={handleCopySearch}>
                        Copy To Clipboard
                      </Button>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;
