import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        onChange={handleChange}
        maxLength={maxLength}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-primary placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

// for a new input tests
/* const Input = ({ handleChange, maxLength }) => {
  return (
    <input
      type="text"
      onChange={handleChange}
      maxLength={maxLength}
      className="input-class"
    />
  );
};

export default Input; */


interface RSSInputProps {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// for a new RSSinput tests
interface RSSInputProps {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
const RSSInput: React.FC<RSSInputProps> = ({ handleChange }) => {
  return (
    <input
      type="text"
      placeholder="RSS feed address here..."
      onChange={handleChange}
      className="input-class"
    />
  );
};
export { RSSInput }
//export default RSSInput;