import { Box, Container, Stack } from "@mui/material";
import { FunctionComponent, memo, useEffect, useMemo } from "react";
import { Outlet } from "react-router-dom";
import SoundMuteFab from "./components/SoundMuteFab";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import BottomGamesCount from "./components/BottomGamesCount";
import { useSounds } from "../../hooks/sounds";
import ConfirmDialog from "../../components/ConfirmDialog";
import ThemeModeFab from "./components/ThemeModeFab";

const LoginView: FunctionComponent = () => {
    const { play, stopAll } = useSounds();
    const { width, height } = useWindowSize();

    useEffect(() => {
        stopAll();
        play("homosangen_fuve", true);
    }, []);

    return (
        <>
            <Confetti width={width} height={height} opacity={0.25} />

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

                backgroundImage: "url(wallpaper/" + Math.floor(Math.random() * 2 + 1) + ".png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        />
    );
});

export default LoginView;
