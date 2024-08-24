import { useState } from 'react';
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
import { Label } from '@/components/ui/label';

interface SearchResponse {
  data: Article[];
  total_count: number;
  page: number;
}

export default function Search() {
  const {
    searchParams,
    searchResults,
    totalCount,
    currentPage,
    sortBy,
    sortOrder,
    setSearchState,
    clearSearchState,
    setSortState,
  } = useSearchContext();

  const [articlesLoading, setArticlesLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [clearTrigger, setClearTrigger] = useState(0);
  const itemsPerPage = 10;

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
        sort_order: params.sort_order || sortOrder,
      };
      const response: SearchResponse = await sendSearchQuery(updatedParams);
      setSearchState(
        updatedParams,
        response.data,
        response.total_count,
        response.page
      );
    } catch (error) {
      console.error('Error in handleSearchQuery:', error);
    } finally {
      setArticlesLoading(false);
    }
  };

  // Sorting
  const handleSort = (column: string) => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortState(column, newSortOrder);
    handleSearchQuery({ sort_by: column, sort_order: newSortOrder });
  };

  // Pagination
  const handlePageChange = (page: number) => {
    setClearTrigger((prev) => prev + 1);
    handleSearchQuery({ ...searchParams, page, per_page: itemsPerPage });
  };

  // Download function
  const handleDownload = (format: 'json' | 'csv' | 'parquet') => {
    handleArticleDownload(format, true, setIsDisabled);
  };

  // Clear function
  const handleClear = () => {
    clearSearchState();
    setClearTrigger((prev) => prev + 1);
  };

  // for search clicks: setClearTrigger resets all the "Show more..."
  const handleSearchButtonClick = (params: SearchParams) => {
    setClearTrigger((prev) => prev + 1);
    handleSearchQuery({ ...params, page: 1 });
  };

  const showPageNumbers = totalCount > 0;

  return (
    <PageLayout title="Search">
      <motion.div variants={itemVariants} className="mt-6 space-y-8">
        <AdvancedSearch
          searchParams={searchParams}
          onSearchParamsChange={(params) =>
            setSearchState(params, searchResults, totalCount, currentPage)
          }
          onSearch={handleSearchButtonClick}
          onDownload={handleDownload}
          onClear={handleClear}
          isDownloadDisabled={isDisabled}
          resultCount={totalCount}
        />
        <Card>
          <CardHeader>
            <CardTitle>
              <div className={`flex items-center justify-between`}>
                <Label className="text-base font-medium">Query results</Label>
                {totalCount !== undefined && (
                  <span className="mr-2 text-sm text-gray-500">
                    {totalCount} articles found
                  </span>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable<Article, unknown>
              columns={articleColumns}
              data={searchResults}
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
