import WordCloud from 'react-d3-cloud';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { stop_words } from './stop-words';

export interface WordData {
  text: string;
  value: number;
}

console.log('');
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
  const freqMap = wordFreq(words.join(' ')).sort(comp).slice(0, 200);

  return (
    <div className="wordcloud h-full w-full">
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
  );
};
