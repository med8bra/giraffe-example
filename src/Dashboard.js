import { NINETEEN_EIGHTY_FOUR, Plot } from "@influxdata/giraffe";
import axios from "axios";
import React from "react";
import { buildQueryVariable, DateTimeLiteral, DurationLiteral } from "./influx-api/types";

const assessments_client = axios.create({
  baseURL: process.env.REACT_APP_ASSESSMENTS_API,
});
console.log({ REACT_APP_ASSESSMENTS_API: process.env.REACT_APP_ASSESSMENTS_API })
// example Flux Query [user entities count for the last year (-1y) with 1h window]
const query = `
from(bucket: "gpld")
  |> range(start: vars.timeRangeStart, stop: vars.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "assessements_entities_total")
  |> filter(fn: (r) => r["_field"] == "count")
  |> filter(fn: (r) => r["app"] == "assessements_api")
  |> filter(fn: (r) => r["type"] == "user")
  |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
  |> yield(name: "mean")
`;

export function Dashboard() {
  const [config, setConfig] = React.useState(undefined)
  const [error, setError] = React.useState(undefined)
  const [timeRangeStart, /*not used */] = React.useState(DateTimeLiteral("2019-07-14T18:45:27.610Z"));
  const [timeRangeStop, /*not used */] = React.useState(DateTimeLiteral("2021-07-14T19:45:27.609Z"));
  const [periodWindow, /*not used */] = React.useState(DurationLiteral({ magnitude: 1, unit: 'h' }));


  // load data
  React.useEffect(() => {
    (async () => {
      const { data: fluxResponse } = await assessments_client.post("metrics/query", {
        query,
        dialect: { annotations: ["group", "datatype", "default"] },
        extern: buildQueryVariable('vars', { timeRangeStart, timeRangeStop, periodWindow })
      });
      const config = {
        // what to render
        fluxResponse,
        // how to render 
        layers: [{
          type: "line",
          x: "_time",
          y: "_value",
          fill: [],
          position: "overlaid",
          interpolation: "monotoneX",
          colors: NINETEEN_EIGHTY_FOUR,
          lineWidth: 1,
          hoverDimension: "auto",
          shadeBelow: true,
          shadeBelowOpacity: 0.1,
        }],
      }
      setConfig(config);
    })().catch(err => {
      console.log("Failed to get metrics: ", { err });
      setError(err.message)
    })
  }, [timeRangeStart, timeRangeStop, periodWindow]);

  if (error)
    return <p> Failed to load metrics: {error} </p>
  if (!config)
    return <p> Waiting for data to load </p>;

  return (
    <div
      style={{
        width: "calc(70vw - 20px)",
        height: "calc(70vh - 20px)",
        margin: "40px",
      }}
    >
      <Plot config={config} />
    </div>
  );
}