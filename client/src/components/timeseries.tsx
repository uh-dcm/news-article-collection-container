import { ResponsiveContainer,
Tooltip,
TooltipProps,
LineChart,
CartesianGrid,
XAxis,
YAxis,
Label,
Line 
} from 'recharts';

import { timeFormat } from "d3-time-format";
import {
    ValueType,
    NameType,
} from 'recharts/types/component/DefaultTooltipContent';

const CustomTooltip = ({
    active,
    payload,
    label,
}: TooltipProps<ValueType, NameType>) => {
    if (active) {
    return (
        <div className="custom-tooltip">
        <p className="label">{`${new Date(label).toLocaleDateString()} : ${payload?.[0].value  }`}</p>
        </div>
    );
    }

    return null;
};

type DomainData = {
    name: string
    count: number
};
  

export default function TimeSeries({data}: {data: DomainData[] })  {
    return ( 
    <div className="mt-3 h-[300px]">
    <ResponsiveContainer width={"100%"} height={300}>
    <LineChart
      data={data === undefined
                    ? [ {time: 0, count: 0} ]
                    :
                    data.map(i => {
                        return {
                        time: new Date(i.name.replace(/\s/g, 'T').concat("Z")).getTime(),
                        count: i.count
                        }
                    })
            }
      margin={{ top: 30, right: 30, left: 30, bottom: 30 }}
    >
      <XAxis type="number" dataKey="time" scale="time" domain={["dataMin", "dataMax"]} tickFormatter={timeFormat("%d-%m%")}>
        <Label
          value={"Time (date)"}
          position="bottom"
          style={{ textAnchor: "middle" }}
        />
      </XAxis>
      <YAxis>
        <Label
          value={"Count (number of articles)"}
          position="left"
          angle={-90}
          style={{ textAnchor: "middle" }}
        />
      </YAxis>
      <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
      <Line
        dataKey="count"
        name="number of articles"
        unit={(" ")}
        dot={false}
        type={"natural"}
      />
    </LineChart>
  </ResponsiveContainer>
    </div>
    )
}