import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function QuestionsAccordion() {
  return (
    <div>
      <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
        Q&A
      </h2>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>How does the collector work?</AccordionTrigger>
          <AccordionContent>
            The news feed article collector gathers contents from all of the
            articles in the RSS feed addresses in the feed list. It processes
            any added feed in the list automatically every 5 minutes as long
            as the fetcher has been activated. You can view statistics of the
            article data and also export the data as a{' '}
            <a
              className="opacity-50 hover:underline hover:opacity-100"
              href="https://en.wikipedia.org/wiki/JSON"
            >
              JSON
            </a>
            ,{' '}
            <a
              className="opacity-50 hover:underline hover:opacity-100"
              href="https://en.wikipedia.org/wiki/Comma-separated_values"
            >
              CSV
            </a>
            , or{' '}
            <a
              className="opacity-50 hover:underline hover:opacity-100"
              href="https://en.wikipedia.org/wiki/Apache_Parquet"
            >
              Parquet
            </a>{' '}
            file.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>How do I use it?</AccordionTrigger>
          <AccordionContent>
            The process is quite simple:
            <ul className="mt-2 list-inside list-decimal space-y-2">
              <li>
                Input the RSS feeds you wish to collect to the list,
                either one-by-one or in a text file with every feed
                on a separate line.
              </li>
              <li>
                (Optional): If you wish, you can select and delete RSS feeds
                from the list.
              </li>
              <li>
                Activate the RSS fetching, which will automatically check
                and process any new URLs in the feeds every 5 minutes.
              </li>
              <li>
                (Optional): If you wish to stop the fetching, you can disable
                it without affecting the feed list.
              </li>
              <li>
                After the fetching is done, you can view statistics of the
                articles you have collected, and perform searches on their
                contents. You can also download the gathered article data
                in three possible formats: JSON, CSV and Parquet.
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
