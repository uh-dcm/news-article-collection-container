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
            The collector gathers all the articles from the RSS-feed addresses
            you have provided and confirmed. When you decide to download the
            content, the program parses all the articles and it then forms a{' '}
            <a
              className="opacity-50 hover:underline hover:opacity-100"
              href="https://en.wikipedia.org/wiki/JSON"
            >
              JSON-file
            </a>{' '}
            from the information it gathered.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>How do I use it?</AccordionTrigger>
          <AccordionContent>
            The process is quite simple:
            <ul className="mt-2 list-inside list-decimal space-y-2">
              <li>Input the wanted RSS-feeds one-by-one</li>
              <li>
                When the you have the all the feeds you wanted, confirm the
                feeds by clicking 'Send selected RSS feeds'
              </li>
              <li>
                (Optional): If you wish, you can select and delete RSS-feeds,
                remember to finalize the changes by confirming, just as done
                before.
              </li>
              <li>Activate the RSS-fetching</li>
              <li>Disable the fetching when needed</li>
              <li>
                Download the gathered articles or preview them by querying with
                search
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
