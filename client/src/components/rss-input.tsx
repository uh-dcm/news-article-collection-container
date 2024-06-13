import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RssInputProps {
  feedUrls: string;
  handleInputChange: (event: {
    target: { value: React.SetStateAction<string> };
  }) => void;
}

export default function RssInput({
  feedUrls,
  handleInputChange,
}: RssInputProps): JSX.Element {
  return (
    <div className="mb-8 mt-10 flex justify-center">
      <div className="flex w-[550px] min-w-[200px] flex-col justify-center">
        <div className="grid w-full gap-1.5">
          <Label className="text-base" htmlFor="message">
            Enter RSS feed URLs, each on their own separate line:
          </Label>
          <Textarea
            value={feedUrls}
            onChange={handleInputChange}
            placeholder="RSS-feed addresses here..."
            rows={4}
            cols={50}
            className="min-h-64 text-nowrap p-2 font-mono text-[14px] hover:overflow-scroll"
          />
        </div>
      </div>
    </div>
  );
}
