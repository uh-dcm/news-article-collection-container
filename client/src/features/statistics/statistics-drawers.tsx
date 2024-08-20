import { ChartPieIcon, ChartBarSquareIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';

{/* stats, its drawer and charts */}
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from '@/components/ui/drawer';
import { DomainData } from '@/components/ui/drawer';
import { PieChart, SubPieChart } from './piechart';
import TimeSeries from './timeseries';
import { WordCloud } from './wordcloud';

interface StatisticsDrawersProps {
  statisticData: DomainData[][];
  subDirectoryData: DomainData[];
  textData: string[];
  isDisabled: boolean;
  handleFetchStatistics: () => void;
  handleFetchText: () => void;
  formSubDirectoryData: (url: string) => void;
  isFiltered: boolean;
}

export default function StatisticsDrawers({
  statisticData,
  subDirectoryData,
  textData,
  isDisabled,
  handleFetchStatistics,
  handleFetchText,
  formSubDirectoryData,
  isFiltered
}: StatisticsDrawersProps) {
  return (
    <>
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            onClick={handleFetchStatistics}
            disabled={isDisabled}
            className="w-full p-6 text-base sm:w-[30%]"
          >
            <div className="flex justify-center">
              <ChartPieIcon className="mr-1.5 size-6" />
              Domain distribution
            </div>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-full">
            <DrawerHeader>
              <DrawerTitle>
                {statisticData.length === 0
                  ? 0
                  : statisticData[0].map((x) => x.count).reduce((s, c) => s + c, 0)}{' '}
                articles collected from{' '}
                {statisticData.length === 0 ? 0 : statisticData[0].length}{' '}
                domain(s) and{' '}
                {statisticData.length === 0 ? 0 : statisticData[1].length}{' '}
                subdirectories{' '}
              </DrawerTitle>
              <DrawerDescription>
                Click on a domain to view the subdirectory distribution
              </DrawerDescription>
            </DrawerHeader>
            <div className="grid grid-cols-1 grid-cols-2 gap-4">
              <PieChart
                data={statisticData[0]}
                fnc={formSubDirectoryData}
                filtered={isFiltered}
              />
              <SubPieChart data={subDirectoryData} />
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <p className="text-center">
                  <Button className="sm:w-[20%]" variant="outline">
                    Close
                  </Button>
                </p>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            onClick={handleFetchStatistics}
            disabled={isDisabled}
            className="w-full p-6 text-base sm:w-[30%]"
          >
            <div className="flex justify-center">
              <ChartBarSquareIcon className="mr-1.5 size-6" />
              Time series
            </div>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Time series for collected articles</DrawerTitle>
              <DrawerDescription>Number of articles collected per day</DrawerDescription>
            </DrawerHeader>
            <TimeSeries data={statisticData[2]} />
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            onClick={handleFetchText}
            disabled={isDisabled}
            className="w-full p-6 text-base sm:w-[30%]"
          >
            <div className="flex justify-center">
              <ChartBarSquareIcon className="mr-1.5 size-6" />
              Word cloud
            </div>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Word cloud for collected articles</DrawerTitle>
              <DrawerDescription>Word cloud on 100 most frequent words in the articles</DrawerDescription>
            </DrawerHeader>
            <WordCloud
              width={500}
              height={400}
              words={ textData  }
            />
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button> 
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
