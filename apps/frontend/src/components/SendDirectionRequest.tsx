import { Directions } from "./Directions.tsx";
import axios from "axios";

export async function sendDirections(request: Directions) {
  const data = JSON.stringify({
      startNodeID: request.start,
      endNodeID: request.end,
  });
  console.log(data);
  //sends a post request the /api/high-score
  //ToDo: change api

  // const res = await axios.get("/api/map/pathfind", data, {
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  // });
    const res = await axios.get('/api/map/pathfind', {
       params: {
            startNodeID: request.start,
            endNodeID: request.end,
        }
    });
  if (res.status == 204) {
      console.log("no path found");
  }
  if (res.status == 200) {
    console.log(res.data);
  }
}
