import { Box, Typography } from "@mui/material";
import { FunctionComponent } from "react";
import { IoGameController } from "react-icons/io5";
import useGamesPlayed from "../../../stores/gamesPlayed";

const BottomGamesCount: FunctionComponent = () => {
  const { started, completed } = useGamesPlayed();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        gap: 1,
        bottom: 0,
        left: 0,
        height: 64,
        width: "100%",
      }}
    >
      <Typography fontSize={18} align="center">
        {started} {started > 1 ? "games" : "game"} started and {completed}{" "}
        completed on this computer
      </Typography>
      <IoGameController size={18} />
    </Box>
  );
};

export default BottomGamesCount;
