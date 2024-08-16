import { Text } from '@visx/text';
import { scaleLog } from '@visx/scale';
import Wordcloud from '@visx/wordcloud/lib/Wordcloud';

export interface WordData {
  text: string;
  value: number;
}

const colors = ['#143059', '#2F6B9A', '#82a6c2'];

function comp(a: WordData, b: WordData) {
  return b.value - a.value
}

function wordFreq(text: string): WordData[] {
  const words: string[] = text.replace(/\./g, '').split(/\s/);
  const freqMap: Record<string, number> = {};

  for (const w of words) {
    if (w !== "" && !freqMap[w]) freqMap[w] = 0;
    freqMap[w] += 1;
  }
  
  return Object.keys(freqMap).map((word) => ({ text: word, value: freqMap[word] }));
}

function getRotationDegree() {
  return 0.5
}

const fixedValueGenerator = () => 0.5;

export const WordCloud = ({ width, height, words}: {width: number, height: number, words: string[] }) => {
  const freqMap = wordFreq(words.join(" ")).sort( comp ).slice(0, 100)

  const fontScale = scaleLog({
    domain: [Math.min(...freqMap.map((w) => w.value)), Math.max(...freqMap.map((w) => w.value))],
    range: [10, 100],
  });
  const fontSizeSetter = (datum: WordData) => fontScale(datum.value);

  return (
    <div className="wordcloud">
      <Wordcloud
        words={freqMap}
        width={width}
        height={height}
        fontSize={fontSizeSetter}
        font={'Impact'}
        padding={2}
        spiral={"archimedean"}
        rotate={ getRotationDegree }
        random={fixedValueGenerator}
      >
        {(cloudWords) =>
          cloudWords.map((w, i) => (
            <Text
              key={w.text}
              fill={colors[i % colors.length]}
              textAnchor={'middle'}
              transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
              fontSize={w.size}
              fontFamily={w.font}
            >
              {w.text}
            </Text>
          ))
        }
      </Wordcloud>
    </div>
  );
}