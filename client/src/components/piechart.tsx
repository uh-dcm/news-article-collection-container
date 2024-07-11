import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
  

type DomainData = {
  name: string
  count: number
};


export const PieChart = ({data, fnc, filtered}: {data: DomainData[], fnc: (arg: string, f: boolean) => void, filtered: boolean}) => {

  const options: ApexOptions = {
    labels: data === undefined ? [] : data.map(x => x.name),
    chart: {
      width: 380,
      type: 'donut',
      events: {
        //@ts-expect-error: Should expect types
        dataPointSelection: (event, chartContext, config) => {   
            fnc(config.w.config.labels[config.dataPointIndex], filtered)
          }
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
