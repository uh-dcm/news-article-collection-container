import { Label } from '@/components/ui/label';

export default function Footer() {
  return (
    <div className="mt-auto flex w-full flex-col items-center p-3">
      <div className="mb-3 flex items-center">
        <Label>
          <a
            className="underline-offset-2 hover:underline"
            href="https://github.com/uh-dcm/news-article-collection-container"
          >
            &copy; University of Helsinki, Digital and Computational Methods
          </a>
        </Label>
      </div>
    </div>
  );
}
