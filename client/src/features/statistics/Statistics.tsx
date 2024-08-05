import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

{/* custom ui */}
import { PageLayout } from '@/components/page-layout';
import { itemVariants } from '@/components/animation-variants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

{/* stats modules */}
import { sendStatisticsQuery } from '@/services/database_queries';
import { DomainData } from '@/components/ui/drawer';
import StatisticsDrawers from './statistics-drawers';

export default function Statistics() {
  const [filteredStatisticData, setFilteredStatisticsData] = useState<DomainData[][]>([]);
  const [filteredSubDirectoryData, setFilteredSubDirectoryData] = useState<DomainData[]>([]);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleFetchStatistics = async () => {
    setIsDisabled(true);
    try {
      const data = await sendStatisticsQuery(true);
      setFilteredStatisticsData(data);
    } catch (error) {
      console.error('Failed to fetch filtered statistics:', error);
      toast.error('Failed to get statistics. Have you fetched yet?');
    } finally {
      setIsDisabled(false);
    }
  };

  const formSubDirectoryData = async (url: string) => {
    setFilteredSubDirectoryData(filteredStatisticData[1].filter((x) => x.name.startsWith(url)));
  };

  return (
    <PageLayout title="Statistics">
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Article statistics</CardTitle>
            <CardDescription>View summary statistics of queried articles</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <StatisticsDrawers
              statisticData={filteredStatisticData}
              subDirectoryData={filteredSubDirectoryData}
              isDisabled={isDisabled}
              handleFetchStatistics={handleFetchStatistics}
              formSubDirectoryData={formSubDirectoryData}
              isFiltered={true}
            />
          </CardContent>
        </Card>
      </motion.div>
    </PageLayout>
  );
}
