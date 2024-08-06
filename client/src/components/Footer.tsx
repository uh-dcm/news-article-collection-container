import { Label } from '@/components/ui/label';

export default function Footer() {
  return (
    <div className="mt-auto flex w-full flex-col items-center p-3">
      <div className="mb-3 flex items-center">
        <Label>
          &copy; University of Helsinki, Digital and Computational Methods
        </Label>
      </div>
    </div>
  );
}
