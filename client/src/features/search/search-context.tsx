import React, { createContext, useState, ReactNode } from 'react';

import { SearchParams } from './advanced-search';
import { Article } from '@/components/ui/article-columns';

interface SearchContextType {
  searchParams: SearchParams;
  searchResults: Article[];
  totalCount: number;
  currentPage: number;
  isAdvancedOpen: boolean;
  setSearchState: (params: SearchParams, results: Article[], total: number, page: number) => void;
  clearSearchState: () => void;
  setIsAdvancedOpen: (isOpen: boolean) => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const setSearchState = (params: SearchParams, results: Article[], total: number, page: number) => {
    setSearchParams(params);
    setSearchResults(results);
    setTotalCount(total);
    setCurrentPage(page);
  };

  const clearSearchState = () => {
    setSearchParams({});
    setSearchResults([]);
    setTotalCount(0);
    setCurrentPage(1);
  };

  return (
    <SearchContext.Provider value={{ 
      searchParams, 
      searchResults, 
      totalCount, 
      currentPage, 
      isAdvancedOpen,
      setSearchState, 
      clearSearchState,
      setIsAdvancedOpen
    }}>
      {children}
    </SearchContext.Provider>
  );
};
