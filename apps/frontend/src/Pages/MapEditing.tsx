//This is the main page with the map, staff sign in, etc on the first slide in Figma.

import SideBar from "../components/SideBar.tsx";
import React, { useState, useEffect } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
// import Canvas from "./Canvas.tsx";
import SVGCanvas from "../components/SVGCanvas.tsx";
import axios from "axios";
import { Edges, Nodes } from "database";
import { Button, ButtonGroup, Stack } from "@mui/material";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import lowerLevel1Map from "../assets/maps/00_thelowerlevel1.png";
import lowerLevel2Map from "../assets/maps/00_thelowerlevel2.png";
import firstFloorMap from "../assets/maps/01_thefirstfloor.png";
import secondFloorMap from "../assets/maps/02_thesecondfloor.png";
import thirdFloorMap from "../assets/maps/03_thethirdfloor.png";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useAuth0 } from "@auth0/auth0-react";

//import Table Items
import Table from "@mui/material/Table";
// import TableBody from '@mui/material/TableBody';
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
// import TableHead from '@mui/material/TableHead';
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { appTheme } from "../Interfaces/MuiTheme.ts";
import { ThemeProvider } from "@mui/material";

const floors = [
  { name: "Lower Level 1", map: lowerLevel1Map, level: "L1" },
  { name: "Lower Level 2", map: lowerLevel2Map, level: "L2" },
  { name: "First Floor", map: firstFloorMap, level: "1" },
  { name: "Second Floor", map: secondFloorMap, level: "2" },
  { name: "Third Floor", map: thirdFloorMap, level: "3" },
];

export default function MapEditing() {
  //Use auth0 react hook
  const {
    getAccessTokenSilently,
    isLoading,
    isAuthenticated,
    loginWithRedirect,
  } = useAuth0();
  if (!isLoading && !isAuthenticated) {
    loginWithRedirect({
      appState: {
        returnTo: location.pathname,
      },
    }).then();
  }

  const [nodes, setNodes] = useState<Nodes[]>();
  const [currentMap, setCurrentMap] = useState(lowerLevel1Map);
  const [nodeClicked, setNodeClicked] = useState<Nodes>();
  const [edgeClicked, setEdgeClicked] = useState<Edges>();
  const [editableEdge, setEditableEdge] = useState<Edges | undefined>();
  const [editableNode, setEditableNode] = useState<Nodes | undefined>();

  const handleNodeClick = (node: Nodes | undefined) => {
    setNodeClicked(node);
    if (node) {
      setEditableNode({ ...node });
    }
  };

  const handleEdgeClicked = (edge: Edges | undefined) => {
    setEdgeClicked(edge);
    if (edge) {
      setEditableEdge({ ...edge });
    }
  };

  useEffect(() => {
    async function fetchData() {
      const res = await axios.get("/api/admin/allnodes/All");
      const allNodes = res.data;
      setNodes(allNodes);
      console.log("successfully got data from get request");
    }
    fetchData().then();
  }, [editableNode, editableEdge]);
  console.log(nodes);

  const editNodeDB = async (
    nodeID: string,
    changeField: string,
    newVal: string,
  ) => {
    const token = await getAccessTokenSilently();
    await axios.post(
      `/api/admin/node/edit/${nodeID}/${changeField}/${newVal}`,
      "",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  };

  const editEdgeDB = async (
    edgeID: string,
    changeField: string,
    newVal: string,
  ) => {
    const token = await getAccessTokenSilently();
    await axios.post(
      `/api/admin/edge/edit/${edgeID}/${changeField}/${newVal}`,
      "",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  };

  return (
    <div
      id="MainPage"
      className="flex h-screen overflow-hidden flex-row bg-[#d6d8d5]"
    >
      <SideBar />
      <main className="flex content-center justify-center leading-none relative flex-grow-1">
        <TransformWrapper alignmentAnimation={{ sizeX: 0, sizeY: 0 }}>
          {({ zoomIn, zoomOut, resetTransform }) => (
            <section>
              <ThemeProvider theme={appTheme}>
                <ButtonGroup
                  variant="contained"
                  color="primary"
                  className="flex absolute top-1 left-1 z-10"
                >
                  <Button
                    onClick={() => zoomOut()}
                    children={<ZoomOutIcon />}
                    className="p-1"
                  />
                  <Button onClick={() => resetTransform()} children={"Reset"} />
                  <Button
                    onClick={() => zoomIn()}
                    children={<ZoomInIcon />}
                    className="p-1"
                  />
                  <Select
                    value={currentMap}
                    onChange={(event) => setCurrentMap(event.target.value)}
                    sx={{
                      backgroundColor: "primary.main",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "primary.dark",
                      },
                      "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "white",
                      },
                    }}
                  >
                    {floors.map((floor, index) => (
                      <MenuItem key={index} value={floor.map}>
                        {floor.name}
                      </MenuItem>
                    ))}
                  </Select>
                </ButtonGroup>
              </ThemeProvider>
              <TransformComponent>
                <SVGCanvas
                  key={currentMap}
                  currentMap={currentMap}
                  currentLevel={
                    floors.find((floor) => floor.map === currentMap)?.level ||
                    ""
                  }
                  handleNodeClicked={handleNodeClick}
                  nodeClicked={nodeClicked}
                  handleEdgeClicked={handleEdgeClicked}
                  edgeClicked={edgeClicked}
                  nodeColor={"orange"}
                  edgeColor={"green"}
                  isHome={false}
                  showPathOnly={false}
                  allnodes={nodes}
                />
              </TransformComponent>
            </section>
          )}
        </TransformWrapper>
      </main>
      <aside className="bg-primary text-secondary flex-shrink fixed top-0 right-0 h-full rounded-l-xl">
        <Stack>
          <h1 className="text-xl bg-transparent p-2 text-center">
            Clicked Node/Edge Information:
          </h1>
          {nodeClicked != undefined && (
            <div className={"items- "}>
              <TableContainer
                sx={{ margin: 5, maxWidth: 350, overflow: "auto" }}
                component={Paper}
              >
                <Table sx={{ maxWidth: 350 }} aria-label="simple table">
                  <TableRow>
                    <TableCell align="left">Node ID:</TableCell>
                    <TableCell align="left">{editableNode?.NodeID}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left">X Coord:</TableCell>
                    <TableCell align="left">
                      <input
                        value={editableNode?.Xcoord || ""}
                        onChange={(e) =>
                          editableNode &&
                          setEditableNode((prev) => {
                            if (prev) {
                              editNodeDB(
                                prev.NodeID,
                                "Xcoord",
                                e.target.value,
                              ).then();
                              return { ...prev, Xcoord: e.target.value };
                            }
                            return prev;
                          })
                        }
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left">Y Coord:</TableCell>
                    <TableCell align="left">
                      <input
                        value={editableNode?.Ycoord || ""}
                        onChange={(e) =>
                          editableNode &&
                          setEditableNode((prev) => {
                            if (prev) {
                              editNodeDB(
                                prev.NodeID,
                                "Ycoord",
                                e.target.value,
                              ).then();
                              return { ...prev, Ycoord: e.target.value };
                            }
                            return prev;
                          })
                        }
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left">Floor:</TableCell>
                    <TableCell align="left">
                      <input
                        value={editableNode?.Floor || ""}
                        onChange={(e) =>
                          editableNode &&
                          setEditableNode((prev) => {
                            if (prev) {
                              editNodeDB(
                                prev.NodeID,
                                "Floor",
                                e.target.value,
                              ).then();
                              return { ...prev, Floor: e.target.value };
                            }
                            return prev;
                          })
                        }
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left">Building:</TableCell>
                    <TableCell align="left">
                      <input
                        value={editableNode?.Building || ""}
                        onChange={(e) =>
                          editableNode &&
                          setEditableNode((prev) => {
                            if (prev) {
                              editNodeDB(
                                prev.NodeID,
                                "Building",
                                e.target.value,
                              ).then();
                              return { ...prev, Building: e.target.value };
                            }
                            return prev;
                          })
                        }
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left">Node Type:</TableCell>
                    <TableCell align="left">
                      <input
                        value={editableNode?.NodeType || ""}
                        onChange={(e) =>
                          editableNode &&
                          setEditableNode((prev) => {
                            if (prev) {
                              editNodeDB(
                                prev.NodeID,
                                "NodeType",
                                e.target.value,
                              ).then();
                              return { ...prev, NodeType: e.target.value };
                            }
                            return prev;
                          })
                        }
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left">Long Name:</TableCell>
                    <TableCell align="left">
                      <input
                        value={editableNode?.LongName || ""}
                        onChange={(e) =>
                          editableNode &&
                          setEditableNode((prev) => {
                            if (prev) {
                              editNodeDB(
                                prev.NodeID,
                                "LongName",
                                e.target.value,
                              ).then();
                              return { ...prev, LongName: e.target.value };
                            }
                            return prev;
                          })
                        }
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left">Short Name:</TableCell>
                    <TableCell align="left">
                      <input
                        value={editableNode?.ShortName || ""}
                        onChange={(e) =>
                          editableNode &&
                          setEditableNode((prev) => {
                            if (prev) {
                              editNodeDB(
                                prev.NodeID,
                                "ShortName",
                                e.target.value,
                              ).then();
                              return { ...prev, ShortName: e.target.value };
                            }
                            return prev;
                          })
                        }
                      />
                    </TableCell>
                  </TableRow>
                </Table>
              </TableContainer>

              {/*<p>NodeID: {nodeClicked.NodeID}</p>*/}
              {/*<p>Xcoord: {nodeClicked.Xcoord}</p>*/}
              {/*<p>Ycoord: {nodeClicked.Ycoord}</p>*/}
              {/*<p>Floor: {nodeClicked.Floor}</p>*/}
              {/*<p>Building: {nodeClicked.Building}</p>*/}
              {/*<p>NodeType: {nodeClicked.NodeType}</p>*/}
              {/*<p>LongName: {nodeClicked.LongName}</p>*/}
              {/*<p>ShortName: {nodeClicked.ShortName}</p>*/}
            </div>
          )}
          {edgeClicked != undefined && (
            <div>
              <TableContainer component={Paper}>
                <Table sx={{ maxWidth: 350 }} aria-label="simple table">
                  <TableRow>
                    <TableCell align="left">Edge ID:</TableCell>
                    <TableCell align="left">
                      {editableEdge?.EdgeID || ""}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left">Start Node:</TableCell>
                    <TableCell align="left">
                      <input
                        value={editableEdge?.StartNodeID || ""}
                        onChange={(e) =>
                          editableEdge &&
                          setEditableEdge((prev) => {
                            if (prev) {
                              editEdgeDB(
                                prev.EdgeID,
                                "StartNodeID",
                                e.target.value,
                              ).then();
                              return { ...prev, StartNodeID: e.target.value };
                            }
                            return prev;
                          })
                        }
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell align="left">End Node:</TableCell>
                    <TableCell align="left">
                      <input
                        value={editableEdge?.EndNodeID || ""}
                        onChange={(e) =>
                          editableEdge &&
                          setEditableEdge((prev) => {
                            if (prev) {
                              editEdgeDB(
                                prev.EdgeID,
                                "EndNodeID",
                                e.target.value,
                              ).then();
                              return { ...prev, EndNodeID: e.target.value };
                            }
                            return prev;
                          })
                        }
                      />
                    </TableCell>
                  </TableRow>
                </Table>
              </TableContainer>

              {/*<p>EdgeID: {edgeClicked.EdgeID}</p>*/}
              {/*<p>StartNodeID: {edgeClicked.StartNodeID}</p>*/}
              {/*<p>EndNodeID: {edgeClicked.EndNodeID}</p>*/}
            </div>
          )}
          {nodeClicked === undefined && edgeClicked === undefined && (
            <div>
              <p>Click on a Node or Edge to view its details</p>
            </div>
          )}
        </Stack>
      </aside>
    </div>
  );
}
