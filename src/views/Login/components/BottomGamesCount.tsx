import { Box, Typography } from "@mui/material";
import { FunctionComponent, useState } from "react";
import { IoGameController } from "react-icons/io5";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { useSounds } from "../../../hooks/sounds";
import useGamesPlayed from "../../../stores/gamesPlayed";

const BottomGamesCount: FunctionComponent = () => {
  const { started, completed, reset } = useGamesPlayed();
  const sounds = useSounds();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClick = () => {
    sounds.play("pop");
    setDialogOpen(true);
  };

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
          pt: 1.5,
          pb: 0.5,
          opacity: 0.75,
          cursor: "pointer",
          userSelect: "none",
          transition: "opacity 0.2s ease, color 0.2s ease",
          "&:hover": {
            opacity: 1,
          },
        }}
      >
        <Typography
          sx={{ fontSize: { xs: 12, sm: 13 } }}
          color="text.secondary"
          align="center"
        >
          {started} {started > 1 ? "games" : "game"} started and {completed}{" "}
          completed on this computer
        </Typography>
        <IoGameController size={14} />
      </Box>

      <ConfirmDialog
        open={dialogOpen}
        title="Reset counter"
        message="Do you want to reset the counter?"
        onConfirm={() => {
          reset();
          setDialogOpen(false);
        }}
        onCancel={() => setDialogOpen(false)}
      />
    </>
  );
};

export default BottomGamesCount;
