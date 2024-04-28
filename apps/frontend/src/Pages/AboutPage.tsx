import swoosh from "../assets/swoosh.png";
import { Box, Tabs, Tab, Link } from "@mui/material";

import AlexanderStoyanov from "../assets/image/AlexanderStoyanov.jpg";
import ArjunVenat from "../assets/image/ArjunVenat.jpg";
import ArtemFrenk from "../assets/image/ArtemFrenk.jpg";
import BrannonHenson from "../assets/image/BrannonHenson.jpeg";
import HubertLiu from "../assets/image/HubertLiu.jpg";
import JavierDeLeon from "../assets/image/JavierDeLeon.jpg";
import JessieHart from "../assets/image/JessieHart.jpg";
import JohnDiamond from "../assets/image/JohnDiamond.jpg";
import LaurenHarrison from "../assets/image/LaurenHarrison.jpg";
import NickGolparvar from "../assets/image/NickGolparvar.jpeg";
import ZihanLi from "../assets/image/ZihanLi.jpg";
import { useState } from "react";

import TypeScriptLogo from "../assets/image/tslogo.jpg";
import ReactLogo from "../assets/image/reactlogo.png";
import YarnLogo from "../assets/image/yarnlogo.png";
import TailwindLogo from "../assets/image/tailwindlogo.png";
import MuiLogo from "../assets/image/muilogo.svg";
import PostgresqlLogo from "../assets/image/postgresqllogo.png";
import PrismaLogo from "../assets/image/prismalogo.svg";
import FramerMotionLogo from "../assets/image/framermotionlogo.svg";
import Auth0Logo from "../assets/image/auth0logo.png";
import AxiosLogo from "../assets/image/axioslogo.png";

import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";

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

export default function AboutPage() {
  const [aboutTab, setAboutTab] = useState<number>(0);

  return (
    <Box display="flex" minHeight="100vh">
      <div
        className="overflow-y-auto h-screen w-full bg-cover bg-center bg-no-repeat relative flex flex-col justify-between"
        style={{
          backgroundImage: `url(${swoosh})`,
        }}
      >
        <div className=" top-0 min-w-full pt-8 bg-primary">
          <Box
            sx={{
              backgroundColor: "#009CA6",
              borderColor: "white",
              display: "flex",
              justifyContent: "center",
              height: "10vh",
              alignItems: "center",
            }}
          >
            <Tabs
              TabIndicatorProps={{ style: { backgroundColor: "#f6bd39" } }}
              value={aboutTab}
              onChange={(event, newValue) => setAboutTab(newValue)}
              aria-label="basic tabs example"
            >
              <Tab
                label="About"
                icon={
                  <PeopleIcon className="mx-2" style={{ fontSize: "2rem" }} />
                }
                sx={{
                  fontSize: "1rem",
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
                label="Credits"
                icon={
                  <AssignmentIcon
                    className="mx-2"
                    style={{ fontSize: "2rem" }}
                  />
                }
                sx={{
                  fontSize: "1rem",
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
          </Box>
        </div>

        <CustomTabPanel value={aboutTab} index={0}>
          <main className="flex-col justify-center items-center leading-none">
            <div
              className="backdrop-blur-md rounded-lg p-10 text-center"
              style={{
                backgroundColor: "rgb(103,124,143, 0.6)",
              }}
            >
              <h2 className="text-2xl font-bold mb-4 text-primary">
                Meet our Developers (Hover for role information)
              </h2>
              <div className="flex justify-center flex-wrap gap-4">
                {[
                  {
                    name: "Artem Frenk",
                    image: ArtemFrenk,
                    position1: "Lead Software Engineer",
                    position2: "Full Stack Engineer",
                    position3: "Co-Product Owner",
                  },
                  {
                    name: "Nick Golparvar",
                    image: NickGolparvar,
                    position1: "Assistant Lead Software Engineer",
                    position2: "Full Stack Engineer",
                  },
                  {
                    name: "Hubert Liu",
                    image: HubertLiu,
                    position1: "Assistant Lead Software Engineer",
                    position2: "Full Stack Engineer",
                  },
                  {
                    name: "Arjun Venat",
                    image: ArjunVenat,
                    position1: "Assistant Lead Software Engineer",
                    position2: "Full Stack Engineer",
                  },
                  {
                    name: "Javier DeLeon",
                    image: JavierDeLeon,
                    position1: "Project Manager",
                    position2: "Full Stack Engineer",
                  },
                  {
                    name: "John Diamond",
                    image: JohnDiamond,
                    position1: "Full Stack Engineer",
                  },
                  {
                    name: "Lauren Harrison",
                    image: LaurenHarrison,
                    position1: "Documentation Analyst",
                    position2: "Full Stack Engineer",
                  },
                  {
                    name: "Jessie Hart",
                    image: JessieHart,
                    position1: "Scrum Master",
                    position2: "Co-Product Owner",
                    position3: "Full Stack Engineer",
                  },
                  {
                    name: "Brannon Henson",
                    image: BrannonHenson,
                    position1: "Full Stack Engineer",
                  },
                  {
                    name: "Zihan Li",
                    image: ZihanLi,
                    position1: "Full Stack Engineer",
                  },
                  {
                    name: "Alex Stoyanov",
                    image: AlexanderStoyanov,
                    position1: "Full Stack Engineer",
                  },
                ].map((developer, index) => (
                  <div
                    key={index}
                    className="relative flex flex-col items-center gap-2"
                  >
                    <div
                      className="absolute bg-black bg-opacity-50 w-full h-full flex flex-col justify-center items-center opacity-0 hover:opacity-100 transition-opacity duration-500 ease-in-out z-10 rounded-full"
                      style={{ width: "200px", height: "200px" }}
                    >
                      <p className="text-center text-sm font-semibold text-white">
                        {developer.position1}
                      </p>
                      <p className="text-center text-sm font-semibold text-white">
                        {developer.position2}
                      </p>
                    </div>
                    <img
                      src={developer.image}
                      alt={developer.name}
                      className="transition-all duration-500 ease-in-out transform hover:scale-105 hover:blur-md rounded-full"
                      style={{
                        width: "200px",
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                    <h3 className="text-center text-lg font-semibold text-primary">
                      {developer.name}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </CustomTabPanel>
        <CustomTabPanel value={aboutTab} index={1}>
          <div className="flex flex-col items-center gap-2">
            <div
              className="backdrop-blur-md rounded-lg p-10 text-center"
              style={{
                backgroundColor: "rgb(103,124,143, 0.6)",
              }}
            >
              <h2 className="text-2xl font-bold mb-2">
                Software Tools, Libraries, and Frameworks
              </h2>
              <div className="flex flex-col items-center justify-center gap-1">
                <Link
                  href="https://www.typescriptlang.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={TypeScriptLogo}
                    alt="TypeScript Logo"
                    style={{ height: "50px", width: "50px" }}
                  />
                  TypeScript
                </Link>
                <Link
                  href="https://reactjs.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={ReactLogo}
                    alt="React Logo"
                    style={{ height: "50px", width: "50px" }}
                  />
                  React
                </Link>
                <Link
                  href="https://yarnpkg.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={YarnLogo}
                    alt="Yarn Logo"
                    style={{ height: "50px", width: "50px" }}
                  />
                  Yarn
                </Link>
                <Link
                  href="https://tailwindcss.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={TailwindLogo}
                    alt="Tailwind CSS Logo"
                    style={{ height: "50px", width: "50px" }}
                  />
                  Tailwind CSS
                </Link>
                <Link
                  href="https://mui.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={MuiLogo}
                    alt="Material-UI Logo"
                    style={{ height: "50px", width: "50px" }}
                  />
                  Material-UI
                </Link>
                <Link
                  href="https://www.postgresql.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={PostgresqlLogo}
                    alt="PostgreSQL Logo"
                    style={{ height: "50px", width: "50px" }}
                  />
                  PostgreSQL
                </Link>
                <Link
                  href="https://www.prisma.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={PrismaLogo}
                    alt="Prisma Logo"
                    style={{ height: "50px", width: "50px" }}
                  />
                  Prisma
                </Link>
                <Link
                  href="https://www.framer.com/motion/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={FramerMotionLogo}
                    alt="Framer Motion Logo"
                    style={{ height: "50px", width: "50px" }}
                  />
                  Framer Motion
                </Link>
                <Link
                  href="https://www.auth0.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={Auth0Logo}
                    alt="Auth0 Logo"
                    style={{ height: "50px", width: "50px" }}
                  />
                  Auth0
                </Link>
                <Link
                  href="https://github.com/axios/axios"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={AxiosLogo}
                    alt="Axios Logo"
                    style={{ height: "50px", width: "50px" }}
                  />
                  Axios
                </Link>
              </div>
            </div>
          </div>
        </CustomTabPanel>

        <div className="flex flex-col items-center justify-center w-full overflow-clip bg-gray-200 py-4 text-center">
          <div className="text-primary">
            WPI Computer Science Department, CS3733-D24 Software Engineering,
            Prof. Wilson Wong
          </div>
          <div className="text-primary">Team Coach: Katy Stuparu</div>
        </div>
      </div>
    </Box>
  );
}
