import axios from "axios";
// import SideBar from "../components/SideBar.tsx";
import { Stack } from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";
import {
  UpDownBox,
  DownloadCSVItem,
} from "../components/UploadDownloadComponents.tsx";

//received help from Dan from team o. He fixed some errors.
export default function DownloadCSV() {
  //Use auth0 react hook
  const { getAccessTokenSilently } = useAuth0();

  async function fetchEdges() {
    // make an http get request to backend
    const token = await getAccessTokenSilently();
    const res = await axios.get("/api/admin/csv/Edges", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    //make a new blob
    const receiveEdges = new Blob([res.data], {
      type: "text/csv;encoding:utf-8",
    });
    downloadBlob(receiveEdges, "edges.csv");
  }

  async function fetchNodes() {
    // make an http get request to backend
    const token = await getAccessTokenSilently();
    const res = await axios.get("/api/admin/csv/Nodes", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    //make a new blob
    const receiveNodes = new Blob([res.data], {
      type: "text/csv;encoding:utf-8",
    });
    downloadBlob(receiveNodes, "nodes.csv");
  }

  async function fetchEmployees() {
    // make an http get request to backend
    const token = await getAccessTokenSilently();
    const res = await axios.get("/api/admin/csv/Employee", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    //make a new blob
    const receiveEmployees = new Blob([res.data], {
      type: "text/csv;encoding:utf-8",
    });
    downloadBlob(receiveEmployees, "employees.csv");
  }

  function downloadBlob(blob: Blob, filePath: string) {
    const blobURL = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = blobURL;
    link.download = filePath;

    document.body.appendChild(link);

    link.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      }),
    );

    document.body.removeChild(link);
  }

  return (
    // <Stack direction="row" spacing={2}>
    //   <SideBar />
    <UpDownBox>
      <h1 className="font-semibold text-xl mb-10 text-primary">
        Download CSV File:
      </h1>
      <Stack direction="row" spacing={5}>
        <DownloadCSVItem
          clickHandler={fetchNodes}
          children="Download Nodes File"
        />
        <DownloadCSVItem
          clickHandler={fetchEdges}
          children="Download Edges File"
        />
        <DownloadCSVItem
          clickHandler={fetchEmployees}
          children="Download Employees File"
        />
      </Stack>
    </UpDownBox>
    // </Stack>
  );
}
