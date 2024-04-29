import { ButtonGroup, Button } from "@mui/material";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { buttonStyle } from "../styles/muiStyles";
import { floors } from "./mapElements.ts";
import { Nodes } from "database";
import { GetColorblindColors } from "./colorblind.ts";
import { useTranslation } from "react-i18next";

export function MapControls(props: {
  zoomOut: () => void;
  resetTransform: () => void;
  zoomIn: () => void;
  children?: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div id="zoom-and-algorithm" className="absolute top-1 left-1 flex gap-1">
      <ButtonGroup variant="contained">
        <Button
          onClick={() => props.zoomOut()}
          children={<ZoomOutIcon />}
          sx={{
            padding: "20px",
            fontSize: "15px",
            backgroundColor: GetColorblindColors().color2,
            ":hover": {
              backgroundColor: GetColorblindColors().color4,
            },
          }}
        />
        <Button
          onClick={() => props.resetTransform()}
          children={t("Reset")}
          sx={{
            padding: "20px",
            fontSize: "15px",
            backgroundColor: GetColorblindColors().color2,
            ":hover": {
              backgroundColor: GetColorblindColors().color4,
            },
          }}
        />
        <Button
          onClick={() => props.zoomIn()}
          children={<ZoomInIcon />}
          sx={{
            padding: "20px",
            fontSize: "15px",
            backgroundColor: GetColorblindColors().color2,
            ":hover": {
              backgroundColor: GetColorblindColors().color4,
            },
          }}
        />
      </ButtonGroup>
      {props.children}
    </div>
  );
}

export function FloorSelect(props: {
  setMap: (newMap: string) => void;
  isDirectionsClicked: boolean;
  path: Nodes[];
  resetMapTransform: () => void;
}) {
  const handleFloorChange = (newMap: string) => {
    props.setMap(newMap);
    props.resetMapTransform();
  };
  return (
    <ButtonGroup
      orientation="vertical"
      variant="contained"
      sx={[
        {
          position: "absolute",
          bottom: "0.25rem",
          left: "0.25rem",
        },
        { ...buttonStyle },
      ]}
    >
      {floors.map((floor, index) => (
        <Button
          key={index}
          onClick={() => handleFloorChange(floor.map)}
          sx={
            props.isDirectionsClicked &&
            props.path.some((node) => node.Floor === floor.level)
              ? {
                  animation: "breathing 2s infinite",
                  "@keyframes breathing": {
                    "0%": { backgroundColor: GetColorblindColors().color2 },
                    "50%": { backgroundColor: GetColorblindColors().color3 },
                    "100%": { backgroundColor: GetColorblindColors().color2 },
                  },
                }
              : {
                  backgroundColor: GetColorblindColors().color2,

                  ":hover": {
                    backgroundColor: GetColorblindColors().color4,
                  },
                }
          }
        >
          {floor.level}
        </Button>
      ))}
    </ButtonGroup>
  );
}
