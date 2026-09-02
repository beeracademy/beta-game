import { Box, Container } from "@mui/material";
import { FunctionComponent, memo } from "react";
import { Outlet } from "react-router-dom";
import TimeSynchronizationWarningDialog from "./components/TimeSynchronizationWarningDialog";
import useLobbyMusic from "./hooks/useLobbyMusic";

const LoginView: FunctionComponent = () => {
  // Ensure lobby music is played and responds to mute/unmute
  useLobbyMusic();

  return (
    <>
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100%",
          height: "100%",
          px: { xs: 0, sm: 2, md: 3 },
          py: { xs: 0, md: 3 },
          overflowY: "auto",
        }}
      >
        <Outlet />

        <Wallpaper />
      </Container>

      <TimeSynchronizationWarningDialog />
    </>
  );
};

const Wallpaper = memo(() => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: 0.2,
        zIndex: -1,
        pointerEvents: "none",
        backgroundImage:
          "url(/wallpaper/" + Math.floor(Math.random() * 5 + 1) + ".png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
});

export default LoginView;
