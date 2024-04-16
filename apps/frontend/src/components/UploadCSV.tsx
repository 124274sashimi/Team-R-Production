import React, { FormEvent, useState } from "react";
import axios from "axios";
// import SideBar from "../components/SideBar.tsx";
import { Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
// import SuccessAlert from "./SuccessAlert.tsx";

// received help from Dan from team o. He fixed some errors.
export default function UploadCSV() {
  //Use auth0 react hook
  const { getAccessTokenSilently } = useAuth0(); // Using Auth0 hook to get access token

  // a local state to store the currently selected file.
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State to store selected file

  const navigate = useNavigate(); // Hook for navigating to different pages

  // Function to navigate to a specific path
  const routeChange = (path: string) => {
    const newPath = `/${path}`;
    navigate(newPath);
  };

  // Function to handle form submission
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission behavior
    const formData = new FormData(); // Create FormData object to store form data
    const token = await getAccessTokenSilently(); // Get access token for authentication

    if (selectedFile != undefined) {
      console.log(selectedFile.name);
      formData.append("uploadFile.csv", selectedFile); // Append selected file to FormData object

      console.log(formData);

      // Send POST request backend server to upload the file
      const response = await axios.post("/api/admin/csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // Include access token for authentication
        },
      });

      if (response.status == 200) {
        console.log("submitted csv successfully");

        //ToDo: Test this!!!
        // SuccessAlert();
        routeChange("home");
      }
    }
  };

  // Function to handle file selection useState
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  return (
    // <Stack direction="row" spacing={2}>
    //   <SideBar />
    <div
      className="grid"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minWidth: "80vw",
      }}
    >
      <div
        className="grid"
        style={{
          justifyContent: "center",
          alignItems: "center",
          display: "grid",
        }}
      >
        <div className="border-2 border-blue rounded-lg p-10">
          <form
            onSubmit={(event) => {
              handleSubmit(event).then();
            }}
          >
            <input type="file" onChange={handleFileSelect} />
            <br />
            <Box mt={5}>
              <Button variant="contained" color="success" type="submit">
                Upload File
              </Button>
            </Box>
          </form>
        </div>
      </div>
    </div>
    // </Stack>
  );
}
