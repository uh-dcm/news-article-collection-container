import { useRef } from 'react';
import html2canvas from 'html2canvas';
import WordCloud from 'react-d3-cloud';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';

import { Button } from '@/components/ui/button';
import { stop_words } from './stop-words';

export interface WordData {
  text: string;
  value: number;
}

function comp(a: WordData, b: WordData) {
  return b.value - a.value;
}

function wordFreq(text: string): WordData[] {
  const words: string[] = text.replace(/\./g, '').split(/\s/);
  const freqMap: Record<string, number> = {};

  for (const w of words) {
    if (w !== '' && !freqMap[w]) freqMap[w] = 0;
    if (stop_words.includes(w.toLowerCase())) freqMap[w] = 0;
    if (!isNaN(parseFloat(w))) freqMap[w] = 0;

    freqMap[w] += 1;
  }

  return Object.keys(freqMap).map((word) => ({
    text: word,
    value: freqMap[word],
  }));
}
const schemeCategory10ScaleOrdinal = scaleOrdinal(schemeCategory10);

export const WordCloudContainer = ({ words }: { words: string[] }) => {
  const wordCloudRef = useRef<HTMLDivElement>(null);

  const handleSaveImage = async () => {
    if (wordCloudRef.current) {
      const canvas = await html2canvas(wordCloudRef.current, {
        backgroundColor: null // background to transparent, otherwise it's just white
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'news-wordcloud.png';
      link.click();
    }
  };

  const freqMap = wordFreq(words.join(' ')).sort(comp).slice(0, 200);

  return (
    <div>
      <div ref={wordCloudRef} className="wordcloud h-full w-full">
        <WordCloud
          data={freqMap}
          width={1500}
          height={1400}
          font="times"
          fontStyle=""
          fontWeight="bold"
          fontSize={(word) => Math.log2(word.value) * 12}
          spiral="archimedean"
          rotate={1}
          padding={5}
          random={Math.random}
          fill={(_d: never, i: string) => schemeCategory10ScaleOrdinal(i)}
        />
      </div>
      <Button onClick={handleSaveImage}>Save as PNG</Button>
    </div>
  );
};
