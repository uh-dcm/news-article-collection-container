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

interface RssInputProps {
  handleFeedAdd: (event: { url: string }) => void;
}

const formSchema = z.object({
  url: z.string().optional(), // simple string, no enforcement, TODO: enforce URL if file is not present?
  file: z.instanceof(File).optional(),
});

export default function RssInput({
  handleFeedAdd,
}: RssInputProps): JSX.Element {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
      file: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.url && isValidUrl(values.url)) {
      handleFeedAdd({ url: values.url });
      form.reset({ url: '' });
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

  return (
    <div>
      <Label className="text-base">Enter RSS feed URL or Upload File:</Label>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="RSS feed URL here..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="file"
            render={() => (
              <FormItem>
                <FormControl>
                  <input type="file" id="rssFileInput" className="file-input" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Add to list</Button>
        </form>
      </Form>
    </div>
  );
}
