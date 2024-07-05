import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

interface RssInputProps {
  handleFeedAdd: (event: { url: string }) => void;
  isUrlSetDisabled: boolean;
}

const formSchema = z.object({
  url: z.string().optional(), // simple string, no enforcement, TODO: enforce URL if file is not present?
  file: z.instanceof(File).optional(),
});

export default function RssInput({
  handleFeedAdd,
  isUrlSetDisabled,
}: RssInputProps): JSX.Element {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
      file: undefined,
    },
  });
  const [isUrlValid, setIsUrlValid] = useState(true);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.url && isValidUrl(values.url)) {
      handleFeedAdd({ url: values.url });
      form.reset({ url: '' });
    } else {
      setIsUrlValid(false);
    }

    const fileInput = document.getElementById(
      'rssFileInput'
    ) as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = function (e) {
        const text = e.target?.result?.toString();
        if (text) {
          text.split('\n').forEach((url) => {
            if (isValidUrl(url)) handleFeedAdd({ url });
          });
        }
      };
      reader.readAsText(file);
    }
    form.reset({ file: undefined }); // reset file input
  }

  function isValidUrl(urlString: string) {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  }

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setIsUrlValid(isValidUrl(url));
    form.setValue('url', url);
  };

  return (
    <div>
      <Label className="text-base">Enter RSS feed URL:</Label>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="RSS feed address here..."
                    {...field}
                    className={`${!isUrlValid ? 'border-red-500' : ''}`}
                    onChange={handleUrlChange}
                  />
                </FormControl>
                {!isUrlValid && (
                  <FormMessage className="text-red-500">
                    Invalid URL
                  </FormMessage>
                )}
              </FormItem>
            )}
          />
          <Button disabled={isUrlSetDisabled} type="submit">
            Add to list
          </Button>

          <div className="w-[13.5rem]">
            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem>
                  <FormControl>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="rssFileInput">
                        <span
                          data-tooltip-id="input-tooltip"
                          data-tooltip-content="Upload a text file containing RSS feed URLs, one per line."
                          className="cursor-pointer"
                        >
                          Text file
                        </span>
                      </Label>
                      <Input
                        id="rssFileInput"
                        type="file"
                        className="cursor-pointer"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
      <ReactTooltip
        id="input-tooltip"
        place="right"
        variant="dark"
        style={{ fontSize: '10px' }}
      />
    </div>
  );
}
