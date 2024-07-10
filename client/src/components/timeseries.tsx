import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const options: ApexOptions = {
  chart: {
    height: 350,
    type: 'line',
    zoom: {
      enabled: true
    },
    animations: {
      enabled: true
    }
  },
  xaxis: {
    type: 'datetime'
  },
  stroke: {
    curve: 'stepline',
  },
  markers: {
    size: 2,
  },
  tooltip: {
    enabled: true,
    theme: "dark",
    followCursor: true
  },
  noData: {
    text: "No data to show."
  }
};

type DomainData = {
  name: string
  count: number
};


const TimeSeries = ({data}: {data: DomainData[]}) => {

  const series = 
    [{
    name: "Count",
    data: data === undefined 
    ? [] 
    :  
    data.map(i => {
    return {
    x: new Date(i.name.replace(/\s/g, 'T').concat("Z")),
    y: i.count
    }
})
}]
  return (
    <ReactApexChart
      options={options}
      series={series}
      type="line"
      height={350}
  />
    )
}

export default TimeSeries 