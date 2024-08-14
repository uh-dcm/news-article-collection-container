import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const version = import.meta.env.VITE_RELEASE_VERSION || 'development';

interface InfoAccordionProps {
  className?: string;
}

export default function InfoAccordion({
  className,
}: InfoAccordionProps) {
  return (
    <div className={className}>
      <Accordion type="multiple">
        <AccordionItem value="item-1">
          <AccordionTrigger>How does the collector work?</AccordionTrigger>
          <AccordionContent>
            The news feed article collector automatically gathers articles from
            the RSS feeds you've added to the list, checking for new content
            every 5 minutes once activated. You can view statistics of the
            article data and also export the data as a{' '}
            <a
              className="opacity-50 hover:underline hover:opacity-100"
              href="https://en.wikipedia.org/wiki/JSON"
              target="_blank"
              rel="noopener noreferrer"
            >
              JSON
            </a>
            ,{' '}
            <a
              className="opacity-50 hover:underline hover:opacity-100"
              href="https://en.wikipedia.org/wiki/Comma-separated_values"
              target="_blank"
              rel="noopener noreferrer"
            >
              CSV
            </a>{' '}
            or{' '}
            <a
              className="opacity-50 hover:underline hover:opacity-100"
              href="https://en.wikipedia.org/wiki/Apache_Parquet"
              target="_blank"
              rel="noopener noreferrer"
            >
              Parquet
            </a>{' '}
            file.
            <p className="mt-2">
              Current version: {version}
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>How do I use it?</AccordionTrigger>
          <AccordionContent>
            <ol className="list-inside list-decimal space-y-2">
              <li>
                <strong>RSS feeds:</strong> On the Dashboard, add RSS feed
                URLs individually or upload a text file with one URL per line.
              </li>
              <li>
                <strong>Toggle fetching:</strong> Activate the fetching
                of the articles in the added feeds. The backend will check
                for new articles every 5 minutes, even when not using the site.
              </li>
              <li>
                <strong>Results:</strong> After fetching, you can:
                <ul className="ml-5 mt-1 list-inside list-disc">
                  <li>
                    See statistics on all collected articles or download them on
                    the Dashboard page.
                  </li>
                  <li>
                    Use the Search page to find specific articles and download
                    them.
                  </li>
                  <li>
                    View detailed statistics of specific articles on the
                    Statistics page.
                  </li>
                  <li>Check for any fetching errors on the Errors page.</li>
                </ul>
              </li>
            </ol>
            <p className="mt-2">
              Note: You can stop fetching at any time without affecting your
              feed list. Reactivating will restart the fetching process
              immediately.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>
            How does the search function work?
          </AccordionTrigger>
          <AccordionContent>
            <p>
              On the Search page, you can perform searches on the contents of
              the articles and also download queried articles as JSON, CSV or
              Parquet. Search inputs are possible in the four data types
              collected: full text, URL, time and HTML.
            </p>
            <p className="mt-2">
              Time is split into start time and end time, with the formatting
              being YYYY-MM-DD HH:MM:SS, and the input of partial values also
              being possible.
            </p>
            <p className="mt-2">
              You can use the AND, OR and NOT boolean operators to refine your
              search, although spaces between words are automatically treated as
              AND. Queries for specific phrases happen by encasing them in
              quotation marks.
            </p>
            <p className="mt-2">Examples:</p>
            <ul className="mt-1 list-inside list-disc space-y-1">
              <li>forest fire smoke</li>
              <li>forest fire OR forest smoke</li>
              <li>fire smoke NOT game</li>
              <li>"forest fire"</li>
              <li>" oulu"</li>
            </ul>
            <p className="mt-2">
              You can do wildcard searches with _ (matches any character) and %
              (matches any sequence of 0+ characters). You can escape % and _
              with ESC: ESC%.
            </p>
            <p className="mt-2">
              Additionally, sometimes the full texts of the articles aren't
              successfully collected by the{' '}
              <a
                className="opacity-50 hover:underline hover:opacity-100"
                href="https://github.com/AndyTheFactory/newspaper4k"
                target="_blank"
                rel="noopener noreferrer"
              >
                newspaper4k
              </a>{' '}
              tool that is at the core of our fetching, in which case try to use
              the HTML data. You can specifically search for those without full
              text with a special query: NOTEXT.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
