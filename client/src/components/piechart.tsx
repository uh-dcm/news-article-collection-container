import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
  

type DomainData = {
  name: string
  count: number
};


export const PieChart = ({data, fnc}: {data: DomainData[], fnc: (arg: string) => void}) => {

  const options: ApexOptions = {
    labels: data === undefined ? [] : data.map(x => x.name),
    chart: {
      width: 380,
      type: 'donut',
      events: {
        //@ts-ignore
        dataPointSelection: (event: any, chartContext: any, config: any) => { 
            fnc(config.w.config.labels[config.dataPointIndex])}
        },
    },
    noData: {
      text: "No data to show."
    }
  };

  const series = data === undefined ? [] : data.map(x => x.count)

  return (
      <ReactApexChart
        options={options}
        series={series}
        type= 'pie'
        height={350}
      />
  )
}

export const SubPieChart = ({data}: {data: DomainData[]}) => {

  const options: ApexOptions = {
    labels: data === undefined ? [] : data.map(x => x.name),
    chart: {
      width: 380,
      type: 'donut'
    },
    noData: {
      text: "No data to show."
    }
  };

  const series = data === undefined ? [] : data.map(x => x.count)

  return (
      <ReactApexChart
        options={options}
        series={series}
        type= 'pie'
        height={350}
      />
  )
}
