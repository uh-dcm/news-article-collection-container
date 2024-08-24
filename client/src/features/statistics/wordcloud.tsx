import { useRef, useState, useMemo, useEffect } from 'react';
import html2canvas from 'html2canvas';
import WordCloud from 'react-d3-cloud';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Plus, Minus } from 'lucide-react';

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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const moveStep = 50; // pixels
  const [wordCloudData, setWordCloudData] = useState<WordData[]>([]);

  useEffect(() => {
    if (words.length > 0 && wordCloudData.length === 0) {
      const newWordCloudData = wordFreq(words.join(' ')).sort(comp).slice(0, 200);
      setWordCloudData(newWordCloudData);
    }
  }, [words, wordCloudData]);

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

  const moveViewpoint = (direction: 'up' | 'down' | 'left' | 'right') => {
    setPosition(prev => {
      switch (direction) {
        case 'up':
          return { ...prev, y: prev.y + moveStep };
        case 'down':
          return { ...prev, y: prev.y - moveStep };
        case 'left':
          return { ...prev, x: prev.x + moveStep };
        case 'right':
          return { ...prev, x: prev.x - moveStep };
      }
    });
  };

  const handleZoom = (delta: number) => {
    setZoom(prevZoom => Math.max(0.5, Math.min(3, prevZoom + delta)));
  };

  const wordCloudComponent = useMemo(() => (
    <WordCloud
      data={wordCloudData}
      width={1500}
      height={1000}
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
  ), [wordCloudData]);

  if (wordCloudData.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div 
        ref={wordCloudRef} 
        className="absolute inset-0"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          transformOrigin: 'center center'
        }}
      >
        {wordCloudComponent}
      </div>
      <div className="absolute bottom-2 left-2">
        <Button onClick={handleSaveImage} size="sm" variant="secondary">Save as PNG</Button>
      </div>
      <div className="absolute bottom-2 right-2 flex flex-col items-center">
        <Button onClick={() => moveViewpoint('up')} size="icon" variant="secondary" className="mb-1 h-6 w-6">
          <ArrowUp size={14} />
        </Button>
        <div className="flex justify-between w-14 mb-1">
          <Button onClick={() => moveViewpoint('left')} size="icon" variant="secondary" className="h-6 w-6">
            <ArrowLeft size={14} />
          </Button>
          <Button onClick={() => moveViewpoint('right')} size="icon" variant="secondary" className="h-6 w-6">
            <ArrowRight size={14} />
          </Button>
        </div>
        <Button onClick={() => moveViewpoint('down')} size="icon" variant="secondary" className="h-6 w-6">
          <ArrowDown size={14} />
        </Button>
      </div>
      <div className="absolute top-2 right-2 flex flex-col items-center">
        <Button onClick={() => handleZoom(0.1)} size="icon" variant="secondary" className="mb-1 h-6 w-6">
          <Plus size={14} />
        </Button>
        <Button onClick={() => handleZoom(-0.1)} size="icon" variant="secondary" className="h-6 w-6">
          <Minus size={14} />
        </Button>
      </div>
    </div>
  );
};
