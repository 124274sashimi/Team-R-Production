import * as React from "react";
import { useState, useEffect } from "react";
import isAdmin from "../components/adminChecker.ts";
import { Employee } from "../Interfaces/Employee.ts";
// import { RequestContext } from "../App";
// import {useNavigate} from "react-router-dom";
import DensitySmallIcon from "@mui/icons-material/DensitySmall";
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
import { GeneralRequest } from "database";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
// import swoosh from "../assets/swoosh.png";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import BuildIcon from "@mui/icons-material/Build";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import CasinoIcon from "@mui/icons-material/Casino";
import { ListOfServices } from "../components/FullServiceRequest";
import { GetColorblindColors } from "../components/colorblind.ts";
import { useTranslation } from "react-i18next";

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

  const { t } = useTranslation();

  let filteredRequestData: GeneralRequest[] = [];
  if (requestData.length != 0) {
    filteredRequestData = requestData.filter(
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
  }

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
      <div
        className="overflow-y-auto flex-grow justify-center items-center bg-cover bg-center backdrop-blur-sm bg-no-repeat"
        style={{
          // backgroundImage: `url(${swoosh})`,
          backgroundColor: "white",
        }}
      >
        <div>
          <div className=" top-0 min-w-full pt-8 bg-primary">
            <Box
              sx={{
                backgroundColor: GetColorblindColors().color2,
                borderColor: "white",
                display: "flex",
                justifyContent: "center",
                height: "10vh",
                alignItems: "center",
              }}
            >
              <Tabs
                TabIndicatorProps={{
                  style: { backgroundColor: GetColorblindColors().color3 },
                }}
                value={selectedTable}
                onChange={(event, newValue) => setSelectedTable(newValue)}
                aria-label="basic tabs example"
              >
                <Tab
                  label={t("All")}
                  icon={
                    <DensitySmallIcon
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
                      fontWeight: "bold",
                    },
                  }}
                />
                <Tab
                  label={t("Flowers")}
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
                      fontWeight: "bold",
                    },
                  }}
                />
                <Tab
                  label={t("Gifts")}
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
                      fontWeight: "bold",
                    },
                  }}
                />
                <Tab
                  label={t("Entertainment")}
                  icon={
                    <CasinoIcon className="mx-2" style={{ fontSize: "2rem" }} />
                  }
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    color: "white",
                    "&.Mui-selected": {
                      color: "#f6bd39",
                      fontWeight: "bold",
                    },
                  }}
                />
                <Tab
                  label={t("Maintenance")}
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
                      fontWeight: "bold",
                    },
                  }}
                />
                <Tab
                  label={t("Medicine")}
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
                      fontWeight: "bold",
                    },
                  }}
                />
                <Tab
                  label={t("Medical Equipment")}
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
                      fontWeight: "bold",
                    },
                  }}
                />
              </Tabs>
              <Box className="flex items-center">
                <Button
                  variant="outlined"
                  onClick={handleClick}
                  sx={{
                    color: GetColorblindColors().color2,
                    backgroundColor: "white",
                    "&:hover": {
                      borderColor: "#f6bd38",
                      backgroundColor: "#f6bd38",
                      color: "white",
                    },
                  }}
                >
                  {t("Filter")}
                </Button>
              </Box>

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
                      {t("Service Type")}
                    </InputLabel>
                    <Select
                      labelId="select-service-type-label"
                      label={t("Service Type")}
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
                          {t(serviceOption)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Box mt={1}>
                    <TextField
                      size="small"
                      label={t("Name")}
                      variant="outlined"
                      value={filters.name}
                      onChange={(e) =>
                        setFilters({ ...filters, name: e.target.value })
                      }
                    />
                  </Box>
                  <FormControl size="small" sx={{ marginTop: 1 }}>
                    <InputLabel id="select-priority-label">
                      {t("Priority")}
                    </InputLabel>
                    <Select
                      labelId="select-priority-label"
                      label={t("Priority")}
                      value={filters.priority}
                      onChange={(e) =>
                        setFilters({ ...filters, priority: e.target.value })
                      }
                    >
                      <MenuItem value="Low">{t("Low")}</MenuItem>
                      <MenuItem value="Medium">{t("Medium")}</MenuItem>
                      <MenuItem value="High">{t("High")}</MenuItem>
                      <MenuItem value="Emergency">{t("Emergency")}</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ marginTop: 1 }}>
                    <InputLabel id="select-priority-label">
                      {t("Employee")} ID
                    </InputLabel>
                    <Select
                      labelId="select-employeeID-label"
                      label={t("Employee") + " ID"}
                      value={filters.employee}
                      onChange={(e) => {
                        setFilters({ ...filters, employee: e.target.value });
                      }}
                    >
                      {employees.map((employee: Employee) => (
                        <MenuItem key={employee.userID} value={employee.userID}>
                          {employee.nickname}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ marginTop: 1 }}>
                    <InputLabel id="select-status-label">
                      {t("Status")}
                    </InputLabel>
                    <Select
                      labelId="select-status-label"
                      label={t("Status")}
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                    >
                      <MenuItem value="Unassigned">{t("Unassigned")}</MenuItem>
                      <MenuItem value="Assigned">{t("Assigned")}</MenuItem>
                      <MenuItem value="InProgress">{t("InProgress")}</MenuItem>
                      <MenuItem value="Closed">{t("Closed")}</MenuItem>
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
                      {t("Reset")}
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        setConfirmedFilters({ ...filters });
                        handleClose();
                      }}
                    >
                      {t("Confirm")}
                    </Button>
                  </Box>
                </Box>
              </Popover>
            </Box>
          </div>

          <CustomTabPanel value={selectedTable} index={0}>
            <div>
              <table className=" bg-white bg-opacity-60 backdrop-blur-md w-4/5 mx-auto">
                <thead>
                  <tr
                    className="text-xl"
                    style={{
                      backgroundColor: "#677c8f",
                      color: "white",
                    }}
                  >
                    <th className=" border-black p-2 ">{t("Service Type")}</th>
                    <th className=" border-black p-2 ">{t("Name")}</th>
                    <th className=" border-black p-2 ">{t("Delivery Date")}</th>
                    <th className=" border-black p-2 ">{t("Room")}</th>
                    <th className=" border-black p-2 ">{t("Priority")}</th>
                    <th className=" border-black p-2 ">{t("Details")} 1</th>
                    <th className=" border-black p-2 ">{t("Details")} 2</th>
                    <th className=" border-black p-2 ">{t("Details")} 3</th>
                    <th className=" border-black p-2 ">{t("Employee")}</th>
                    <th className=" border-black w-10 ">{t("Status")}</th>
                    <th className=" border-black p-2 ">{t("Actions")}</th>
                    {/*<th className="border border-black">Details</th>*/}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequestData.length > 0 &&
                    filteredRequestData
                      // .filter((row) => row.RequestType === "Flowers")
                      .map((row, index) => (
                        <tr
                          key={index}
                          style={{
                            borderWidth: 2,
                            borderColor: "white",
                            backgroundColor: "rgb(103,124,143, 0.15)",
                          }}
                        >
                          <td className="border-black text-center p-2">
                            {t(row.RequestType)}
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
                            {t(row.Priority)}
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
                                sx={{ width: 150 }}
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
                                  <MenuItem
                                    key={employee.userID}
                                    value={employee.userID}
                                  >
                                    {employee.nickname}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <FormControl fullWidth>
                              <Select
                                sx={{ width: 150 }}
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
                                  {t("Unassigned")}
                                </MenuItem>
                                <MenuItem value="Assigned">
                                  {t("Assigned")}
                                </MenuItem>
                                <MenuItem value="InProgress">
                                  {t("InProgress")}
                                </MenuItem>
                                <MenuItem value="Closed">
                                  {t("Closed")}
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => deleteService(row)}
                            >
                              {t("Delete")}
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
              <table className=" bg-white bg-opacity-60 backdrop-blur-md w-4/5 mx-auto">
                <thead>
                  <tr
                    className="text-xl"
                    style={{
                      backgroundColor: "#677c8f",
                      color: "white",
                    }}
                  >
                    <th className=" border-black p-2 ">{t("Service Type")}</th>
                    <th className=" border-black p-2 ">{t("Name")}</th>
                    <th className=" border-black p-2 ">{t("Sub Type")}</th>
                    <th className=" border-black p-2 ">{t("Delivery Date")}</th>
                    <th className=" border-black p-2 ">{t("Room")}</th>
                    <th className=" border-black p-2 ">{t("Priority")}</th>
                    <th className=" border-black p-2 ">{t("Details")}</th>
                    <th className=" border-black p-2 ">
                      {t("Size of Bouquet")}
                    </th>
                    <th className=" border-black p-2 ">{t("Employee")}</th>
                    <th className=" border-black w-10 ">{t("Status")}</th>
                    <th className=" border-black p-2 ">{t("Actions")}</th>
                    {/*<th className="border border-black">Details</th>*/}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequestData.length > 0 &&
                    filteredRequestData
                      .filter((row) => row.RequestType === "Flowers")
                      .map((row, index) => (
                        <tr
                          key={index}
                          style={{
                            borderWidth: 2,
                            borderColor: "white",
                            backgroundColor: "rgb(103,124,143, 0.15)",
                          }}
                        >
                          <td className="border-black text-center p-2">
                            {t(row.RequestType)}
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
                            {t(row.Priority)}
                          </td>
                          <td className="border-black text-center p-2">
                            {row.Details1}
                          </td>
                          <td className="border-black text-center p-2">
                            {t(row.Details2)}
                          </td>
                          <td className="border-black text-center p-2">
                            <FormControl fullWidth>
                              <Select
                                sx={{ width: 150 }}
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
                                  <MenuItem
                                    key={employee.userID}
                                    value={employee.userID}
                                  >
                                    {employee.nickname}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <FormControl fullWidth>
                              <Select
                                sx={{ width: 150 }}
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
                                  {t("Unassigned")}
                                </MenuItem>
                                <MenuItem value="Assigned">
                                  {t("Assigned")}
                                </MenuItem>
                                <MenuItem value="InProgress">
                                  {t("InProgress")}
                                </MenuItem>
                                <MenuItem value="Closed">
                                  {t("Closed")}
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => deleteService(row)}
                            >
                              {t("Delete")}
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
              <table className="bg-white bg-opacity-60 backdrop-blur-md w-4/5 mx-auto">
                <thead>
                  <tr
                    className="text-xl"
                    style={{
                      backgroundColor: "#677c8f",
                      color: "white",
                    }}
                  >
                    <th className=" border-black p-2 ">{t("Service Type")}</th>
                    <th className=" border-black p-2 ">{t("Name")}</th>
                    <th className=" border-black p-2 ">{t("Sub Type")}</th>
                    <th className=" border-black p-2 ">{t("Delivery Date")}</th>
                    <th className=" border-black p-2 ">{t("Room")}</th>
                    <th className=" border-black p-2 ">{t("Priority")}</th>
                    <th className=" border-black p-2 ">{t("Message")}</th>
                    <th className=" border-black p-2 ">{t("Wrapped")}</th>
                    <th className=" border-black p-2 ">{t("Employee")}</th>
                    <th className=" border-black p-2 ">{t("Status")}</th>
                    <th className=" border-black p-2 ">{t("Actions")}</th>
                    {/*<th className="border border-black">Details</th>*/}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequestData.length > 0 &&
                    filteredRequestData
                      .filter((row) => row.RequestType === "Gifts")
                      .map((row, index) => (
                        <tr
                          key={index}
                          style={{
                            borderWidth: 2,
                            borderColor: "white",
                            backgroundColor: "rgb(103,124,143, 0.15)",
                          }}
                        >
                          <td className="border-black text-center p-2">
                            {t(row.RequestType)}
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
                            {t(row.Priority)}
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
                                sx={{ width: 150 }}
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
                                  <MenuItem
                                    key={employee.userID}
                                    value={employee.userID}
                                  >
                                    {employee.nickname}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <FormControl fullWidth>
                              <Select
                                sx={{ width: 150 }}
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
                                  {t("Unassigned")}
                                </MenuItem>
                                <MenuItem value="Assigned">
                                  {t("Assigned")}
                                </MenuItem>
                                <MenuItem value="InProgress">
                                  {t("InProgress")}
                                </MenuItem>
                                <MenuItem value="Closed">
                                  {t("Closed")}
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => deleteService(row)}
                            >
                              {t("Delete")}
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
              <table className=" bg-white bg-opacity-60 backdrop-blur-md w-4/5 mx-auto">
                <thead>
                  <tr
                    className="text-xl"
                    style={{
                      backgroundColor: "#677c8f",
                      color: "white",
                    }}
                  >
                    <th className=" border-black p-2 ">{t("Service Type")}</th>
                    <th className=" border-black p-2 ">{t("Name")}</th>
                    <th className=" border-black p-2 ">{t("Delivery Date")}</th>
                    <th className=" border-black p-2 ">{t("Room")}</th>
                    <th className=" border-black p-2 ">{t("Priority")}</th>
                    <th className=" border-black p-2 ">{t("Details")}</th>
                    <th className=" border-black p-2 ">
                      {t("Type of Entertainment")}
                    </th>
                    <th className=" border-black p-2 ">13+</th>
                    <th className=" border-black p-2 ">{t("Employee")}</th>
                    <th className=" border-black p-2 ">{t("Status")}</th>
                    <th className=" border-black p-2 ">{t("Actions")}</th>
                    {/*<th className="border border-black">Details</th>*/}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequestData.length > 0 &&
                    filteredRequestData
                      .filter((row) => row.RequestType === "Entertainment")
                      .map((row, index) => (
                        <tr
                          key={index}
                          style={{
                            borderWidth: 2,
                            borderColor: "white",
                            backgroundColor: "rgb(103,124,143, 0.15)",
                          }}
                        >
                          <td className="border-black text-center p-2">
                            {t(row.RequestType)}
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
                            {t(row.Priority)}
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
                                sx={{ width: 150 }}
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
                                  <MenuItem
                                    key={employee.userID}
                                    value={employee.userID}
                                  >
                                    {employee.nickname}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <FormControl fullWidth>
                              <Select
                                sx={{ width: 150 }}
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
                                  {t("Unassigned")}
                                </MenuItem>
                                <MenuItem value="Assigned">
                                  {t("Assigned")}
                                </MenuItem>
                                <MenuItem value="InProgress">
                                  {t("InProgress")}
                                </MenuItem>
                                <MenuItem value="Closed">
                                  {t("Closed")}
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => deleteService(row)}
                            >
                              {t("Delete")}
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
              <table className=" bg-white bg-opacity-60 backdrop-blur-md w-4/5 mx-auto">
                <thead>
                  <tr
                    className="text-xl"
                    style={{
                      backgroundColor: "#677c8f",
                      color: "white",
                    }}
                  >
                    <th className=" border-black p-2 ">{t("Service Type")}</th>
                    <th className=" border-black p-2 ">{t("Name")}</th>
                    <th className=" border-black p-2 ">{t("Delivery Date")}</th>
                    <th className=" border-black p-2 ">{t("Room")}</th>
                    <th className=" border-black p-2 ">{t("Priority")}</th>
                    <th className=" border-black p-2 ">{t("Details")}</th>
                    <th className=" border-black p-2 ">
                      {t("Type of maintenance")}
                    </th>
                    <th className=" border-black p-2 ">
                      {t("Hazardous Material")}
                    </th>
                    <th className=" border-black p-2 ">{t("Employee")}</th>
                    <th className=" border-black p-2 ">{t("Status")}</th>
                    <th className=" border-black p-2 ">{t("Actions")}</th>
                    {/*<th className="border border-black">Details</th>*/}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequestData.length > 0 &&
                    filteredRequestData
                      .filter((row) => row.RequestType === "Maintenance")
                      .map((row, index) => (
                        <tr
                          key={index}
                          style={{
                            borderWidth: 2,
                            borderColor: "white",
                            backgroundColor: "rgb(103,124,143, 0.15)",
                          }}
                        >
                          <td className="border-black text-center p-2">
                            {t(row.RequestType)}
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
                            {t(row.Priority)}
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
                                sx={{ width: 150 }}
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
                                  <MenuItem
                                    key={employee.userID}
                                    value={employee.userID}
                                  >
                                    {employee.nickname}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <FormControl fullWidth>
                              <Select
                                sx={{ width: 150 }}
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
                                  {t("Unassigned")}
                                </MenuItem>
                                <MenuItem value="Assigned">
                                  {t("Assigned")}
                                </MenuItem>
                                <MenuItem value="InProgress">
                                  {t("InProgress")}
                                </MenuItem>
                                <MenuItem value="Closed">
                                  {t("Closed")}
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => deleteService(row)}
                            >
                              {t("Delete")}
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
          <CustomTabPanel value={selectedTable} index={5}>
            <div>
              <table className="bg-white bg-opacity-60 backdrop-blur-md w-4/5 mx-auto">
                <thead>
                  <tr
                    className="text-xl"
                    style={{
                      backgroundColor: "#677c8f",
                      color: "white",
                    }}
                  >
                    <th className="  border-black p-2">{t("Service Type")}</th>
                    <th className="  border-black p-2">{t("Name")}</th>
                    <th className="  border-black p-2">{t("Delivery Date")}</th>
                    <th className="  border-black p-2">{t("Room")}</th>
                    <th className="  border-black p-2">{t("Priority")}</th>
                    <th className="  border-black p-2">{t("Details")}</th>
                    <th className="  border-black p-2">{t("Dosage")}</th>
                    <th className="  border-black p-2">{t("Route")}</th>
                    <th className=" border-black p-2 ">{t("Employee")}</th>
                    <th className="  border-black p-2">{t("Status")}</th>
                    <th className="  border-black p-2">{t("Actions")}</th>
                    {/*<th className="border border-black">Details</th>*/}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequestData.length > 0 &&
                    filteredRequestData
                      .filter((row) => row.RequestType === "Medicine")
                      .map((row, index) => (
                        <tr
                          key={index}
                          style={{
                            borderWidth: 2,
                            borderColor: "white",
                            backgroundColor: "rgb(103,124,143, 0.15)",
                          }}
                        >
                          <td className="border-black text-center p-2">
                            {t(row.RequestType)}
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
                            {t(row.Priority)}
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
                                sx={{ width: 150 }}
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
                                  <MenuItem
                                    key={employee.userID}
                                    value={employee.userID}
                                  >
                                    {employee.nickname}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <FormControl fullWidth>
                              <Select
                                sx={{ width: 150 }}
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
                                  {t("Unassigned")}
                                </MenuItem>
                                <MenuItem value="Assigned">
                                  {t("Assigned")}
                                </MenuItem>
                                <MenuItem value="InProgress">
                                  {t("InProgress")}
                                </MenuItem>
                                <MenuItem value="Closed">
                                  {t("Closed")}
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => deleteService(row)}
                            >
                              {t("Delete")}
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
          <CustomTabPanel value={selectedTable} index={6}>
            <div>
              <table className="bg-white bg-opacity-60 backdrop-blur-md w-4/5 mx-auto">
                <thead>
                  <tr
                    className="text-xl"
                    style={{
                      backgroundColor: "#677c8f",
                      color: "white",
                    }}
                  >
                    <th className="  border-black p-2">{t("Service Type")}</th>
                    <th className="  border-black p-2">{t("Name")}</th>
                    <th className="  border-black p-2">{t("Delivery Date")}</th>
                    <th className="  border-black p-2">{t("Room")}</th>
                    <th className="  border-black p-2">{t("Priority")}</th>
                    <th className="  border-black p-2">{t("Details")}</th>
                    <th className="  border-black p-2">{t("Quantity")}</th>
                    <th className="  border-black p-2">
                      {t("Requires Supervision")}
                    </th>
                    <th className=" border-black p-2 ">{t("Employee")}</th>
                    <th className="  border-black p-2">{t("Status")}</th>
                    <th className="  border-black p-2">{t("Actions")}</th>
                    {/*<th className="border border-black">Details</th>*/}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequestData.length > 0 &&
                    filteredRequestData
                      .filter((row) => row.RequestType === "Medical Equipment")
                      .map((row, index) => (
                        <tr
                          key={index}
                          style={{
                            borderWidth: 2,
                            borderColor: "white",
                            backgroundColor: "rgb(103,124,143, 0.15)",
                          }}
                        >
                          <td className="border-black text-center p-2">
                            {t(row.RequestType)}
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
                            {t(row.Priority)}
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
                                sx={{ width: 150 }}
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
                                  <MenuItem
                                    key={employee.userID}
                                    value={employee.userID}
                                  >
                                    {employee.nickname}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <FormControl fullWidth>
                              <Select
                                sx={{ width: 150 }}
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
                                  {t("Unassigned")}
                                </MenuItem>
                                <MenuItem value="Assigned">
                                  {t("Assigned")}
                                </MenuItem>
                                <MenuItem value="InProgress">
                                  {t("InProgress")}
                                </MenuItem>
                                <MenuItem value="Closed">
                                  {t("Closed")}
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </td>
                          <td className="border-black text-center p-2">
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => deleteService(row)}
                            >
                              {t("Delete")}
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
