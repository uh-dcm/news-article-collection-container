import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { SearchParams } from './advanced-search';
import { Article } from '@/components/ui/article-columns';

interface SearchContextType {
  searchParams: SearchParams;
  searchResults: Article[];
  totalCount: number;
  currentPage: number;
  isAdvancedOpen: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  setSearchState: (
    params: SearchParams,
    results: Article[],
    total: number,
    page: number
  ) => void;
  clearSearchState: () => void;
  setIsAdvancedOpen: (isOpen: boolean) => void;
  setSortState: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

const STORAGE_KEY = 'persistentSearchState';

const getInitialState = () => {
  if (typeof window !== 'undefined') {
    const storedState = localStorage.getItem(STORAGE_KEY);
    if (storedState) {
      return JSON.parse(storedState);
    }
  }
  return {
    searchParams: {},
    searchResults: [],
    totalCount: 0,
    currentPage: 1,
    isAdvancedOpen: false,
    sortBy: 'time',
    sortOrder: 'desc',
  };
};

export const SearchContext = createContext<SearchContextType | undefined>(
  undefined
);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState(getInitialState);

  const saveState = useCallback((newState: Partial<SearchContextType>) => {
    setState((prevState: Partial<SearchContextType>) => {
      const updatedState = { ...prevState, ...newState };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
      return updatedState;
    });
  }, []);

  const setSearchState = useCallback(
    (params: SearchParams, results: Article[], total: number, page: number) => {
      saveState({
        searchParams: params,
        searchResults: results,
        totalCount: total,
        currentPage: page,
      });
    },
    [saveState]
  );

  const clearSearchState = useCallback(() => {
    saveState({
      searchParams: {},
      searchResults: [],
      totalCount: 0,
      currentPage: 1,
      sortBy: 'time',
      sortOrder: 'desc',
    });
    localStorage.removeItem(STORAGE_KEY);
  }, [saveState]);

  const setIsAdvancedOpen = useCallback(
    (isOpen: boolean) => {
      saveState({ isAdvancedOpen: isOpen });
    },
    [saveState]
  );

  const setSortState = useCallback(
    (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
      saveState({ sortBy: newSortBy, sortOrder: newSortOrder });
    },
    [saveState]
  );

  return (
    <SearchContext.Provider
      value={{
        ...state,
        setSearchState,
        clearSearchState,
        setIsAdvancedOpen,
        setSortState,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
