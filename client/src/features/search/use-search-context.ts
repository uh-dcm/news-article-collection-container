// eslint complained if this wasn't in its own file

import { useContext } from 'react';
import { SearchContext } from './search-context';

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
};
