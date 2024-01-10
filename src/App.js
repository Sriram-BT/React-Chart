import React, { useEffect, useState, useCallback } from 'react';
import DataSource from 'devextreme/data/data_source';
import Chart, {
  ArgumentAxis, Series, ZoomAndPan, Legend, ScrollBar,  Font,LoadingIndicator
} from 'devextreme-react/chart';
// import { zoomingData } from './data.js';

let packetsLock = 0;

const chartDataSource = new DataSource({
  store: [],
  sort: 'date',
  paginate: false,
});
const wholeRange = {
  startValue: new Date("2009-01-01T00:00:02.000000Z"),
  endValue: new Date("2009-11-01T00:00:10.000000Z"),
};
function App() {

  const [visualRange, setVisualRange] = useState({ startValue: new Date("2009-01-01T00:00:02.000000Z"), endValue: new Date("2009-01-01T00:00:10.000000Z") });
  // const [wholeRange, setWholeRange] = useState({ startValue: new Date("2009-01-01T00:00:02.000000Z"), endValue: new Date("2009-11-01T00:00:10.000000Z") });

//   useEffect(async()=>{
//     let startValue=await apiCall(`SELECT pickup_datetime ,trip_distance FROM trips LIMIT 1;`)
//     let endValue=await apiCall(`SELECT pickup_datetime ,trip_distance FROM trips ORDER BY pickup_datetime DESC LIMIT 1;`)
//     setWholeRange({startValue: new Date(startValue[0].pickup_datetime), endValue: new Date(endValue[0].pickup_datetime) })

// console.log("sdfv",startValue)
//   },[])
  let apiCall= async(querys)=>{
    let query = querys;
    // let query = `SELECT pickup_datetime ,trip_distance  FROM trips WHERE pickup_datetime BETWEEN '${visualRange.startValue.toISOString()}' and '${visualRange.endValue.toISOString()}';`
    const response = await fetch(
      `https://demo.questdb.io/exec?query=${encodeURIComponent(query)}`,
    )
    const json = await response.json()
    let zoomingData = []
    json.dataset.map((data) => {
      const date = data[0];
      let value = { [json.columns[0].name]: date, [json.columns[1].name]: data[1] }
      zoomingData = [...zoomingData, value]
    })
    return zoomingData
  }
  let getDataFrame = async (currentStart,currentEnd) => {
  
    let query = `SELECT pickup_datetime ,trip_distance  FROM trips WHERE pickup_datetime BETWEEN '${currentStart.toISOString()}' and '${currentEnd.toISOString()}';`
    // let query = `SELECT pickup_datetime ,trip_distance  FROM trips WHERE pickup_datetime BETWEEN '${visualRange.startValue.toISOString()}' and '${visualRange.endValue.toISOString()}';`
    const response = await fetch(
      `https://demo.questdb.io/exec?query=${encodeURIComponent(query)}`,
    )
    const json = await response.json()
    let zoomingData = []
    json.dataset.map((data) => {
      const date = data[0];
      let value = { [json.columns[0].name]: date, [json.columns[1].name]: data[1] }
      zoomingData = [...zoomingData, value]
    })
    return zoomingData
  }

  const onChanges=(component,currentStart,currentEnd)=>{
    const dataSource = component.getDataSource();
    packetsLock += 1;
    component.showLoadingIndicator();
    getDataFrame(currentStart,currentEnd).then((dataFrame) => {
      const componentStorage = dataSource.store();
      packetsLock -= 1;
      dataFrame
        .map((i) => ({
          X: new Date(i.pickup_datetime),
          Y: i.trip_distance
        }))
        .forEach((item) => {
          componentStorage.insert(item)
        }
        );
        dataSource.reload();
    })
  }

  const handleChange = useCallback(
    (e) => {
      if (e.fullName === 'argumentAxis.visualRange') {
        const stateStart = visualRange.startValue;
        const endStart = visualRange.endValue;
        const currentStart = e.value.startValue;
        const currentEnd = e.value.endValue;
        const dataSource = e.component.getDataSource();
        const storage = dataSource.items();
        if ((stateStart.toLocaleString() !== currentStart.toLocaleString() || endStart.toLocaleString() !== currentEnd.toLocaleString()) && !packetsLock  ||!storage.length) {
       
        if(stateStart.toLocaleString() !== currentStart.toLocaleString() || endStart.toLocaleString() !== currentEnd.toLocaleString())
        {
        setVisualRange({ startValue: new Date(currentStart), endValue: new Date(currentEnd) });
        }
        onChanges( e.component,currentStart,currentEnd)
        }

      }
    },
    [setVisualRange, visualRange],
  );
  return (
    <Chart
      id="chart"
      palette="Harmony Light"
      dataSource={chartDataSource}
      onOptionChanged={handleChange}

    >
      <Series
        argumentField="X"
        valueField="Y"
      />

      <ArgumentAxis argumentType="datetime"  defaultVisualRange={visualRange} wholeRange={wholeRange}  visualRangeUpdateMode="keep" />
      <ScrollBar visible={true} />
      <LoadingIndicator backgroundColor="none">
        <Font size={14} />
      </LoadingIndicator> 
      <ZoomAndPan argumentAxis="both" />
      <Legend visible={false} />
    </Chart>
  );
}

export default App;

