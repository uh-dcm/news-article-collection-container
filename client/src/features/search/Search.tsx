import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';

{/* custom ui */}
import { PageLayout } from '@/components/page-layout';
import { itemVariants } from '@/components/animation-variants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

{/* search, its results and download function */}
import { sendSearchQuery, SearchParams } from '@/services/database-queries';
import { DataTable } from '@/components/ui/data-table';
import { articleColumns, Article } from '@/components/ui/article-columns';
import { handleArticleDownload } from '@/services/article-download';

export default function Search() {
  const [searchData, setSearchData] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [textQuery, setTextQuery] = useState('');
  const [urlQuery, setUrlQuery] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [htmlQuery, setHtmlQuery] = useState('');

  {/* Search function */}
  const handleSearchQuery = async () => {
    setArticlesLoading(true);
    try {
      const params: SearchParams = { textQuery, urlQuery, startTime, endTime, htmlQuery };
      const data = await sendSearchQuery(params);
      setSearchData(data);
    } catch (error) {
      console.error('Error in handleSearchQuery:', error);
    } finally {
      setArticlesLoading(false);
    }
  };

  {/* Two const below are Clear button related */}
  const [clearTrigger, setClearTrigger] = useState(0);

  const handleClear = () => {
    setTextQuery('');
    setUrlQuery('');
    setStartTime('');
    setEndTime('');
    setHtmlQuery('');
    setSearchData([]);
    setClearTrigger(prev => prev + 1);
  };

  {/* remove this and the useeffect import to disable autosearch */}
  useEffect(() => {
    handleSearchQuery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageLayout title="Search">
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="relative">
            <CardTitle className="text-lg">Search articles</CardTitle>
            <CardDescription>Query and export articles with matching data</CardDescription>
            <div className="absolute right-4 top-4 flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={handleClear} className="h-8 px-2 text-xs">
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            <Input className="w-full p-6" onChange={(e) => setTextQuery(e.target.value)} placeholder="Insert text query..." value={textQuery} />
            <Input className="w-full p-6" onChange={(e) => setUrlQuery(e.target.value)} placeholder="Insert URL query..." value={urlQuery} />
            <Input className="w-full p-6" type="text" placeholder="Insert start time... (YYYY-MM-DD HH:MM:SS)" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <Input className="w-full p-6" type="text" placeholder="Insert end time... (YYYY-MM-DD HH:MM:SS)" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            <Input className="w-full p-6" type="text" placeholder="Insert HTML query..." value={htmlQuery} onChange={(e) => setHtmlQuery(e.target.value)} />
            <Button className="w-full p-6 text-base" variant="outline" onClick={handleSearchQuery}>
              <div className="flex justify-center">
                <MagnifyingGlassIcon className="mr-3 size-6" />
                Search
              </div>
            </Button>
          </CardContent>
          <CardContent>
              <DataTable
                  columns={articleColumns}
                  data={searchData}
                  tableName={'Query results'}
                  isLoading={articlesLoading}
                  reducedSpacing={true}
                  showGlobalFilter={true}
                  onClear={clearTrigger}
                  />
              </CardContent>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              {['JSON', 'CSV', 'Parquet'].map((format) => (
                  <Button
                  key={format.toLowerCase()}
                  variant="outline"
                  onClick={() => handleArticleDownload(format.toLowerCase() as 'json' | 'csv' | 'parquet', true, setIsDisabled)}
                  disabled={isDisabled || searchData.length === 0}
                  className="w-full p-6 text-base sm:w-[30%]"
                  >
                  <div className="flex justify-center">
                      <ArrowDownTrayIcon className="mr-1.5 size-6" />
                      {`${format} (Query)`}
                  </div>
                  </Button>
              ))}
          </CardContent>
        </Card>
      </motion.div>
    </PageLayout>
  );
}
