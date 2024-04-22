import * as React from "react";
import { useState, useEffect } from "react";
import isAdmin from "../components/adminChecker.ts";
import { Employee } from "../Interfaces/Employee.ts";
// import { RequestContext } from "../App";
// import {useNavigate} from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Popover,
  TextField,
  InputLabel,
} from "@mui/material";
import Sidebar from "../components/SideBar.tsx";
import { GeneralRequest } from "database";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import swoosh from "../assets/swoosh.png";

import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import BuildIcon from "@mui/icons-material/Build";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import { ListOfServices } from "../components/FullServiceRequest";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface FilterValue {
  serviceType: string;
  name: string;
  priority: string;
  employee: string;
  status: string;
}

function ServiceRequestTable({ availableServices }: ListOfServices) {
  //Use auth0 react hook
  const {
    getAccessTokenSilently,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    user,
  } = useAuth0();
  if (!isLoading && !isAuthenticated) {
    loginWithRedirect({
      appState: {
        returnTo: location.pathname,
      },
    }).then();
  }

  // const { requests } = useContext(RequestContext);

  // const navigate = useNavigate();
  const [requestData, setrequestData] = useState<GeneralRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  const [filters, setFilters] = React.useState<FilterValue>({
    serviceType: "",
    name: "",
    priority: "",
    employee: "",
    status: "",
  });
  const [confirmedFilters, setConfirmedFilters] = React.useState<FilterValue>({
    serviceType: "",
    name: "",
    priority: "",
    employee: "",
    status: "",
  });

  const filteredRequestData = requestData.filter(
    (item) =>
      (!confirmedFilters.serviceType ||
        confirmedFilters.serviceType === item.RequestType) &&
      (!confirmedFilters.name ||
        item.RequesterName.includes(confirmedFilters.name)) &&
      (!confirmedFilters.priority ||
        confirmedFilters.priority === item.Priority) &&
      (!confirmedFilters.employee ||
        confirmedFilters.employee === item.EmployeeID) &&
      (!confirmedFilters.status || confirmedFilters.status === item.Status),
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  useEffect(() => {
    async function fetch() {
      //First determine if the user is an admin\
      const adminStatus: boolean = await isAdmin(
        isAuthenticated,
        isLoading,
        user!,
      );
      let employeeFilter = "";
      if (!adminStatus) {
        employeeFilter = `?employeeFilter=${user!.sub}`;
      }

      //get token
      const token = await getAccessTokenSilently();

      //Get all employees (if admin)
      const empRes = await axios.get("/api/admin/allEmployees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedEmployees: Employee[] = [];
      empRes.data.map((employee: Employee) => {
        if (adminStatus) {
          updatedEmployees.push(employee);
        } else if (employee.userID == user!.sub) {
          updatedEmployees.push(employee);
        }
      });
      setEmployees(updatedEmployees);

      //Get all service requests
      const res = await axios.get(`/api/service/create${employeeFilter}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setrequestData(res.data);
    }
    fetch().then();
  }, [getAccessTokenSilently, user, isAuthenticated, isLoading, employees]);

  const deleteService = async (service: GeneralRequest) => {
    const token = await getAccessTokenSilently();
    const res = await axios.delete(
      `api/admin/service/del/Single/${service.RequestID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const index = requestData.indexOf(service);
    requestData.splice(index, 1);
    setrequestData([...requestData]);

    if (res.status == 200) {
      console.log("request deleted");
    }
  };

  const updateServiceRequests = async (
    service: GeneralRequest,
    editVal: string,
    newStatus: string,
  ) => {
    const token = await getAccessTokenSilently();
    const res = await axios
      .post(
        `/api/admin/service/edit/${service.RequestID}/${editVal}/${newStatus}`,
        "",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then();
    const index = requestData.indexOf(service);
    const requestData2: GeneralRequest[] = [...requestData];
    if (editVal == "Status") {
      requestData2[index].Status = newStatus;
    } else {
      requestData2[index].EmployeeID = newStatus;
    }
    setrequestData(requestData2);

    if (res.status == 200) {
      console.log("request status changed");
    }
  };

  const [selectedTable, setSelectedTable] = useState(0);

  return (
    <Box display="flex">
      <Sidebar />

      <div
        className="overflow-y-auto flex-grow justify-center items-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${swoosh})`,
          width: "100vw",
          height: "100vh",
        }}
      >
        <div>
          <div className=" bg-primary bg-opacity-75 backdrop-blur-md top-0 min-w-full pt-8 ">
            <h1 className="text-5xl text-white font-bold p-2 text-left  w-full">
              Service Request Tables
            </h1>
            <Box
              sx={{
                position: "relative",
                borderBottom: 1,
                borderColor: "white",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Tabs
                TabIndicatorProps={{ style: { backgroundColor: "#f6bd39" } }}
                value={selectedTable}
                onChange={(event, newValue) => setSelectedTable(newValue)}
                aria-label="basic tabs example"
              >
                <Tab
                  label=" Flowers "
                  icon={
                    <LocalFloristIcon
                      className="mx-2"
                      style={{ fontSize: "2rem" }}
                    />
                  }
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    color: "white",
                    "&.Mui-selected": {
                      color: "#f6bd39",
                    },
                  }}
                />
                <Tab
                  label=" Gifts "
                  icon={
                    <CardGiftcardIcon
                      className="mx-2"
                      style={{ fontSize: "2rem" }}
                    />
                  }
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    color: "white",
                    "&.Mui-selected": {
                      color: "#f6bd39",
                    },
                  }}
                />
                <Tab
                  label=" Maintenance "
                  icon={
                    <BuildIcon className="mx-2" style={{ fontSize: "2rem" }} />
                  }
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    color: "white",
                    "&.Mui-selected": {
                      color: "#f6bd39",
                    },
                  }}
                />
                <Tab
                  label=" Medicine "
                  icon={
                    <VaccinesIcon
                      className="mx-2"
                      style={{ fontSize: "2rem" }}
                    />
                  }
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    color: "white",
                    "&.Mui-selected": {
                      color: "#f6bd39",
                    },
                  }}
                />
                <Tab
                  label=" Medical Equipment "
                  icon={
                    <MonitorHeartIcon
                      className="mx-2"
                      style={{ fontSize: "2rem" }}
                    />
                  }
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    color: "white",
                    "&.Mui-selected": {
                      color: "#f6bd39",
                    },
                  }}
                />
              </Tabs>
              <Box
                sx={{
                  position: "absolute",
                  right: 10,
                  top: 15,
                }}
              >
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleClick}
                >
                  Filter
                </Button>
                <Popover
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                >
                  <Box display="flex" flexDirection="column" sx={{ p: 2 }}>
                    <FormControl size="small">
                      <InputLabel id="select-service-type-label">
                        Service Type
                      </InputLabel>
                      <Select
                        labelId="select-service-type-label"
                        label="Service Type"
                        value={filters.serviceType}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            serviceType: e.target.value,
                          })
                        }
                      >
                        {availableServices.map((serviceOption: string) => (
                          <MenuItem key={serviceOption} value={serviceOption}>
                            {serviceOption}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Box mt={1}>
                      <TextField
                        size="small"
                        label="Name"
                        variant="outlined"
                        value={filters.name}
                        onChange={(e) =>
                          setFilters({ ...filters, name: e.target.value })
                        }
                      />
                    </Box>
                    <FormControl size="small" sx={{ marginTop: 1 }}>
                      <InputLabel id="select-priority-label">
                        Priority
                      </InputLabel>
                      <Select
                        labelId="select-priority-label"
                        label="Priority"
                        value={filters.priority}
                        onChange={(e) =>
                          setFilters({ ...filters, priority: e.target.value })
                        }
                      >
                        <MenuItem value="Low">Low</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="High">High</MenuItem>
                        <MenuItem value="Emergency">Emergency</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ marginTop: 1 }}>
                      <InputLabel id="select-priority-label">
                        Employee ID
                      </InputLabel>
                      <Select
                        labelId="select-employeeID-label"
                        label="Employee ID"
                        value={filters.employee}
                        onChange={(e) => {
                          setFilters({ ...filters, employee: e.target.value });
                        }}
                      >
                        {employees.map((employee: Employee) => (
                          <MenuItem value={employee.userID}>
                            {employee.nickname}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ marginTop: 1 }}>
                      <InputLabel id="select-status-label">Status</InputLabel>
                      <Select
                        labelId="select-status-label"
                        label="Status"
                        value={filters.status}
                        onChange={(e) =>
                          setFilters({ ...filters, status: e.target.value })
                        }
                      >
                        <MenuItem value="Unassigned">Unassigned</MenuItem>
                        <MenuItem value="Assigned">Assigned</MenuItem>
                        <MenuItem value="InProgress">InProgress</MenuItem>
                        <MenuItem value="Closed">Closed</MenuItem>
                      </Select>
                    </FormControl>
                    <Box display="flex" gap={1} mt={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          setFilters({
                            serviceType: "",
                            name: "",
                            priority: "",
                            employee: "",
                            status: "",
                          })
                        }
                      >
                        Reset
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          setConfirmedFilters({ ...filters });
                          handleClose();
                        }}
                      >
                        Confirm
                      </Button>
                    </Box>
                  </Box>
                </Popover>
              </Box>
            </Box>
          </div>

          <CustomTabPanel value={selectedTable} index={0}>
            <div>
              <table className=" bg-white bg-opacity-60 backdrop-blur-md w-4/5 mx-auto">
                <thead>
                  <tr className="text-xl">
                    <th className="bg-primary border-black p-2 text-white">
                      Service Type
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Name
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Sub Type
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Delivery Date
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Room
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Priority
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Details
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Size of Bouquet
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Employee
                    </th>
                    <th className="bg-primary border-black w-10 text-white">
                      Status
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Actions
                    </th>
                    {/*<th className="border border-black">Details</th>*/}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequestData.length > 0 &&
                    filteredRequestData
                      .filter((row) => row.RequestType === "Flowers")
                      .map((row, index) => (
                        <tr key={index}>
                          <td className="border-black text-center p-2">
                            {row.RequestType}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.RequesterName}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.Details1}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.DeliveryDate.toString()}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.LocationNodeID}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.Priority}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.Details1}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.Details2}
                          </td>
                          <td className="border-black text-center p-2">
                            <FormControl fullWidth>
                              <Select
                                sx={{ width: 200 }}
                                value={row.EmployeeID}
                                onChange={(e) => {
                                  updateServiceRequests(
                                    row,
                                    "EmployeeID",
                                    e.target.value,
                                  ).then();
                                }}
                              >
                                {employees.map((employee: Employee) => (
                                  <MenuItem value={employee.userID}>
                                    {employee.nickname}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <FormControl fullWidth>
                              <Select
                                sx={{ width: 200 }}
                                value={row.Status}
                                onChange={(e) => {
                                  updateServiceRequests(
                                    row,
                                    "Status",
                                    e.target.value as string,
                                  ).then();
                                }}
                              >
                                <MenuItem value="Unassigned">
                                  Unassigned
                                </MenuItem>
                                <MenuItem value="Assigned">Assigned</MenuItem>
                                <MenuItem value="InProgress">
                                  InProgress
                                </MenuItem>
                                <MenuItem value="Closed">Closed</MenuItem>
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => deleteService(row)}
                            >
                              Delete
                            </Button>
                          </td>
                          {/*<td className="border border-black text-center">*/}
                          {/*  {row. }//flowers doesnt store details */}
                          {/*</td>*/}
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </CustomTabPanel>
          <CustomTabPanel value={selectedTable} index={1}>
            <div>
              <table className="bg-white bg-opacity-60 backdrop-blur-md w-4/5 mx-auto">
                <thead>
                  <tr className="text-xl">
                    <th className="bg-primary border-black p-2 text-white">
                      Service Type
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Name
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Sub Type
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Delivery Date
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Room
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Priority
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Message
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Wrapped
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Employee
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Status
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Actions
                    </th>
                    {/*<th className="border border-black">Details</th>*/}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequestData.length > 0 &&
                    filteredRequestData
                      .filter((row) => row.RequestType === "Gifts")
                      .map((row, index) => (
                        <tr key={index}>
                          <td className="border-black text-center p-2">
                            {row.RequestType}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.RequesterName}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.Details1}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.DeliveryDate.toString()}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.LocationNodeID}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.Priority}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.Details1}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.Details3}
                          </td>
                          <td className="border-black text-center p-2">
                            <FormControl fullWidth>
                              <Select
                                sx={{ width: 200 }}
                                value={row.EmployeeID}
                                onChange={(e) => {
                                  updateServiceRequests(
                                    row,
                                    "EmployeeID",
                                    e.target.value,
                                  ).then();
                                }}
                              >
                                {employees.map((employee: Employee) => (
                                  <MenuItem value={employee.userID}>
                                    {employee.nickname}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <FormControl fullWidth>
                              <Select
                                sx={{ width: 200 }}
                                value={row.Status}
                                onChange={(e) => {
                                  updateServiceRequests(
                                    row,
                                    "Status",
                                    e.target.value as string,
                                  ).then();
                                }}
                              >
                                <MenuItem value="Unassigned">
                                  Unassigned
                                </MenuItem>
                                <MenuItem value="Assigned">Assigned</MenuItem>
                                <MenuItem value="InProgress">
                                  InProgress
                                </MenuItem>
                                <MenuItem value="Closed">Closed</MenuItem>
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => deleteService(row)}
                            >
                              Delete
                            </Button>
                          </td>
                          {/*<td className="border border-black text-center">*/}
                          {/*  {row. }//flowers doesnt store details */}
                          {/*</td>*/}
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </CustomTabPanel>
          <CustomTabPanel value={selectedTable} index={2}>
            <div>
              <table className=" bg-white bg-opacity-60 backdrop-blur-md w-4/5 mx-auto">
                <thead>
                  <tr className="text-xl">
                    <th className="bg-primary border-black p-2 text-white">
                      Service Type
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Name
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Delivery Date
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Room
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Priority
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Details
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Type of maintenance
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Hazardous Material
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Employee
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Status
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Actions
                    </th>
                    {/*<th className="border border-black">Details</th>*/}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequestData.length > 0 &&
                    filteredRequestData
                      .filter((row) => row.RequestType === "Maintenance")
                      .map((row, index) => (
                        <tr key={index}>
                          <td className="border-black text-center p-2">
                            {row.RequestType}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.RequesterName}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.DeliveryDate.toString()}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.LocationNodeID}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.Priority}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.Details1}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.Details2}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.Details3}
                          </td>
                          <td className="border-black text-center p-2">
                            <FormControl fullWidth>
                              <Select
                                sx={{ width: 200 }}
                                value={row.EmployeeID}
                                onChange={(e) => {
                                  updateServiceRequests(
                                    row,
                                    "EmployeeID",
                                    e.target.value,
                                  ).then();
                                }}
                              >
                                {employees.map((employee: Employee) => (
                                  <MenuItem value={employee.userID}>
                                    {employee.nickname}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <FormControl fullWidth>
                              <Select
                                sx={{ width: 200 }}
                                value={row.Status}
                                onChange={(e) => {
                                  updateServiceRequests(
                                    row,
                                    "Status",
                                    e.target.value as string,
                                  ).then();
                                }}
                              >
                                <MenuItem value="Unassigned">
                                  Unassigned
                                </MenuItem>
                                <MenuItem value="Assigned">Assigned</MenuItem>
                                <MenuItem value="InProgress">
                                  InProgress
                                </MenuItem>
                                <MenuItem value="Closed">Closed</MenuItem>
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => deleteService(row)}
                            >
                              Delete
                            </Button>
                          </td>
                          {/*<td className="border border-black text-center">*/}
                          {/*  {row. }//flowers doesnt store details */}
                          {/*</td>*/}
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </CustomTabPanel>
          <CustomTabPanel value={selectedTable} index={3}>
            <div>
              <table className="bg-white bg-opacity-60 backdrop-blur-md w-4/5 mx-auto">
                <thead>
                  <tr className="text-xl">
                    <th className="bg-primary text-white border-black p-2">
                      Service Type
                    </th>
                    <th className="bg-primary text-white border-black p-2">
                      Name
                    </th>
                    <th className="bg-primary text-white border-black p-2">
                      Delivery Date
                    </th>
                    <th className="bg-primary text-white border-black p-2">
                      Room
                    </th>
                    <th className="bg-primary text-white border-black p-2">
                      Priority
                    </th>
                    <th className="bg-primary text-white border-black p-2">
                      Details
                    </th>
                    <th className="bg-primary text-white border-black p-2">
                      Dosage
                    </th>
                    <th className="bg-primary text-white border-black p-2">
                      Route
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Employee
                    </th>
                    <th className="bg-primary text-white border-black p-2">
                      Status
                    </th>
                    <th className="bg-primary text-white border-black p-2">
                      Actions
                    </th>
                    {/*<th className="border border-black">Details</th>*/}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequestData.length > 0 &&
                    filteredRequestData
                      .filter((row) => row.RequestType === "Medicine")
                      .map((row, index) => (
                        <tr key={index}>
                          <td className="border-black text-center p-2">
                            {row.RequestType}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.RequesterName}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.DeliveryDate.toString()}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.LocationNodeID}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.Priority}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.Details1}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.Details2}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.Details3}
                          </td>
                          <td className="border-black text-center p-2">
                            <FormControl fullWidth>
                              <Select
                                sx={{ width: 200 }}
                                value={row.EmployeeID}
                                onChange={(e) => {
                                  updateServiceRequests(
                                    row,
                                    "EmployeeID",
                                    e.target.value,
                                  ).then();
                                }}
                              >
                                {employees.map((employee: Employee) => (
                                  <MenuItem value={employee.userID}>
                                    {employee.nickname}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <FormControl fullWidth>
                              <Select
                                sx={{ width: 200 }}
                                value={row.Status}
                                onChange={(e) => {
                                  updateServiceRequests(
                                    row,
                                    "Status",
                                    e.target.value as string,
                                  ).then();
                                }}
                              >
                                <MenuItem value="Unassigned">
                                  Unassigned
                                </MenuItem>
                                <MenuItem value="Assigned">Assigned</MenuItem>
                                <MenuItem value="InProgress">
                                  InProgress
                                </MenuItem>
                                <MenuItem value="Closed">Closed</MenuItem>
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => deleteService(row)}
                            >
                              Delete
                            </Button>
                          </td>
                          {/*<td className="border border-black text-center">*/}
                          {/*  {row. }//flowers doesnt store details */}
                          {/*</td>*/}
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </CustomTabPanel>
          <CustomTabPanel value={selectedTable} index={4}>
            <div>
              <table className="bg-white bg-opacity-60 backdrop-blur-md w-4/5 mx-auto">
                <thead>
                  <tr className="text-xl">
                    <th className="bg-primary text-white border-black p-2">
                      Service Type
                    </th>
                    <th className="bg-primary text-white border-black p-2">
                      Name
                    </th>
                    <th className="bg-primary text-white border-black p-2">
                      Delivery Date
                    </th>
                    <th className="bg-primary text-white border-black p-2">
                      Room
                    </th>
                    <th className="bg-primary text-white border-black p-2">
                      Priority
                    </th>
                    <th className="bg-primary text-white border-black p-2">
                      Details
                    </th>
                    <th className="bg-primary text-white border-black p-2">
                      Quantity
                    </th>
                    <th className="bg-primary text-white border-black p-2">
                      Requires Supervision
                    </th>
                    <th className="bg-primary border-black p-2 text-white">
                      Employee
                    </th>
                    <th className="bg-primary text-white border-black p-2">
                      Status
                    </th>
                    <th className="bg-primary text-white border-black p-2">
                      Actions
                    </th>
                    {/*<th className="border border-black">Details</th>*/}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequestData.length > 0 &&
                    filteredRequestData
                      .filter((row) => row.RequestType === "Medical Equipment")
                      .map((row, index) => (
                        <tr key={index}>
                          <td className="border-black text-center p-2">
                            {row.RequestType}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.RequesterName}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.DeliveryDate.toString()}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.LocationNodeID}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.Priority}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.Details1}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.Details2}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.Details3}
                          </td>
                          <td className="border-black text-center p-2">
                            <FormControl fullWidth>
                              <Select
                                sx={{ width: 200 }}
                                value={row.EmployeeID}
                                onChange={(e) => {
                                  updateServiceRequests(
                                    row,
                                    "EmployeeID",
                                    e.target.value,
                                  ).then();
                                }}
                              >
                                {employees.map((employee: Employee) => (
                                  <MenuItem value={employee.userID}>
                                    {employee.nickname}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <FormControl fullWidth>
                              <Select
                                sx={{ width: 200 }}
                                value={row.Status}
                                onChange={(e) => {
                                  updateServiceRequests(
                                    row,
                                    "Status",
                                    e.target.value as string,
                                  ).then();
                                }}
                              >
                                <MenuItem value="Unassigned">
                                  Unassigned
                                </MenuItem>
                                <MenuItem value="Assigned">Assigned</MenuItem>
                                <MenuItem value="InProgress">
                                  InProgress
                                </MenuItem>
                                <MenuItem value="Closed">Closed</MenuItem>
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => deleteService(row)}
                            >
                              Delete
                            </Button>
                          </td>
                          {/*<td className="border border-black text-center">*/}
                          {/*  {row. }//flowers doesnt store details */}
                          {/*</td>*/}
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </CustomTabPanel>
        </div>
      </div>
    </Box>
  );
}

export default ServiceRequestTable;
