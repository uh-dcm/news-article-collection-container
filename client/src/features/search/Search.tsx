import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// custom ui
import { PageLayout } from '@/components/page-layout';
import { itemVariants } from '@/components/animation-variants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// search, its results and download function
import { useSearchContext } from './use-search-context';
import AdvancedSearch, { SearchParams } from './advanced-search';  
import { sendSearchQuery } from '@/services/database-queries';
import { DataTable } from '@/components/ui/data-table';
import { articleColumns, Article } from '@/components/ui/article-columns';
import { handleArticleDownload } from '@/services/article-download';

interface SearchResponse {
  data: Article[];
  total_count: number;
}

export default function Search() {
  const {
    searchParams: contextSearchParams,
    searchResults: contextSearchResults,
    totalCount: contextTotalCount,
    currentPage: contextCurrentPage,
    setSearchState,
    clearSearchState,
  } = useSearchContext();
  const [searchData, setSearchData] = useState<Article[]>(contextSearchResults || []);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [clearTrigger, setClearTrigger] = useState(0);
  const [totalCount, setTotalCount] = useState(contextTotalCount || 0);
  const [currentPage, setCurrentPage] = useState(contextCurrentPage || 1);
  const itemsPerPage = 10;
  const [sortBy, setSortBy] = useState<string>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // check if existing search
  useEffect(() => {
    if (contextSearchResults.length > 0) {
      setSearchData(contextSearchResults);
      setTotalCount(contextTotalCount);
      setCurrentPage(contextCurrentPage);
      setSearchParams(contextSearchParams);
    }
  }, [contextSearchResults, contextTotalCount, contextCurrentPage, contextSearchParams]);

  const [searchParams, setSearchParams] = useState<SearchParams>(contextSearchParams || {
    generalQuery: '',
    textQuery: '',
    urlQuery: '',
    startTime: '',
    endTime: '',
    htmlQuery: '',
  });

  // Search function
  const handleSearchQuery = async (params: Partial<SearchParams>) => {
    setArticlesLoading(true);
    try {
      const updatedParams: SearchParams = {
        ...searchParams,
        ...params,
        page: params.page || currentPage,
        per_page: itemsPerPage,
        sort_by: params.sort_by || sortBy,
        sort_order: params.sort_order || sortOrder
      };
      setSearchParams(updatedParams);
      const response: SearchResponse = await sendSearchQuery(updatedParams);
      setSearchData(response.data);
      setTotalCount(response.total_count);
      setSearchState(updatedParams, response.data, response.total_count, updatedParams.page || currentPage);
    } catch (error) {
      console.error('Error in handleSearchQuery:', error);
    } finally {
      setArticlesLoading(false);
    }
  };

  // Sorting
  const handleSort = (column: string) => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortOrder(newSortOrder);
    handleSearchQuery({ sort_by: column, sort_order: newSortOrder });
  };

  // Pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    handleSearchQuery({ ...searchParams, page, per_page: itemsPerPage });
  };

  // Download function
  const handleDownload = (format: 'json' | 'csv' | 'parquet') => {
    handleArticleDownload(format, true, setIsDisabled);
  };

  // Clear function
  const handleClear = () => {
    setSearchData([]);
    setTotalCount(0);
    setCurrentPage(1);
    setClearTrigger(prev => prev + 1);
    clearSearchState();
  };

  const showPageNumbers = totalCount > 0;

  return (
    <PageLayout title="Search">
      <motion.div variants={itemVariants} className="space-y-8">
        <AdvancedSearch 
          searchParams={searchParams}
          onSearchParamsChange={setSearchParams}
          onSearch={handleSearchQuery}
          onDownload={handleDownload}
          onClear={handleClear}
          isDownloadDisabled={isDisabled}
          resultCount={totalCount}
        />
        <Card>
          <CardHeader>
            <CardTitle>Query results ({totalCount})</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable<Article, unknown>
              columns={articleColumns}
              data={searchData}
              tableName={'Query results'}
              isLoading={articlesLoading}
              reducedSpacing={true}
              onClear={clearTrigger}
              hideTitle={true}
              totalCount={totalCount}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              showPagination={true}
              showPageNumbers={showPageNumbers}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          </CardContent>
        </Card>
      </motion.div>
    </PageLayout>
  );
}
