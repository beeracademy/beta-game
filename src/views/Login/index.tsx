import { Box, Container, Stack } from "@mui/material";
import { FunctionComponent, memo } from "react";
import { Outlet } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import BottomGamesCount from "./components/BottomGamesCount";
import SoundMuteFab from "./components/SoundMuteFab";
import ThemeModeFab from "./components/ThemeModeFab";
import TimeSynchronizationWarningDialog from "./components/TimeSynchronizationWarningDialog";

const LoginView: FunctionComponent = () => {
  return (
    <>
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Outlet />

        <BottomGamesCount />

        <Stack
          spacing={1}
          sx={{
            position: "absolute",
            bottom: 16,
            right: 16,
          }}
        >
          <SoundMuteFab absolutePosition={false} />
          <ThemeModeFab absolutePosition={false} />
        </Stack>

        <Wallpaper />

        <ConfirmDialog
          title="Create new user"
          message="Do you want to create user 'test'?"
          open={false}
          onCancel={() => {}}
          onConfirm={() => {}}
        />
      </Container>

      <TimeSynchronizationWarningDialog />
    </>
  );
};

const Wallpaper = memo(() => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: 0.2,
        zIndex: -1,

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
