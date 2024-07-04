import { Key } from 'react';

interface HighlightTextProps {
  text: string;
  highlight: string;
}

export function HighlightedText({ text, highlight }: HighlightTextProps) {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part: string, i: Key) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-300">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}
