import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogProps,
    DialogTitle,
    Divider,
    Stack,
    Switch,
    Typography,
    useTheme,
} from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import { GoDeviceDesktop, GoDeviceMobile } from "react-icons/go";
import QRCode from "react-qr-code";
import useGame from "../../../stores/game";
import useSettings from "../../../stores/settings";

interface RemoteDialogProps extends DialogProps {}

const RemoteDialog: FunctionComponent<RemoteDialogProps> = (props) => {
    const theme = useTheme();

    const game = useGame((state) => ({
        players: state.players,
    }));

    const settings = useSettings((state) => ({
        remoteControl: state.remoteControl,
        remoteToken: state.remoteToken,
        SetRemoteControl: state.SetRemoteControl,
    }));

    const [url, setUrl] = useState("");

    useEffect(() => {
        if (!settings.remoteControl) {
            return;
        }

        setUrl(`${window.location.origin}/remote?token=${settings.remoteToken}`);
    }, [settings.remoteControl, settings.remoteToken]);

    return (
        <Dialog {...props}>
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography
                        sx={{
                            fontSize: 20,
                        }}
                    >
                        Game Remote
                    </Typography>
                    <Switch
                        color="primary"
                        checked={settings.remoteControl}
                        onChange={(event) => {
                            setUrl("");
                            settings.SetRemoteControl(event.target.checked);
                        }}
                    />
                </Stack>
            </DialogTitle>

            <Divider />

            {!settings.remoteControl && (
                <DialogContent
                    sx={{
                        maxWidth: 400,
                        textAlign: "center",
                    }}
                >
                    <Box
                        sx={{
                            padding: 4,
                            opacity: 0.75,
                        }}
                    >
                        <GoDeviceMobile size={74} />
                        <GoDeviceDesktop size={74} />
                    </Box>

                    <Typography>
                        Game remote allows you to control the game from your phone. You can use it to draw cards, see
                        game metrics, and more.
                    </Typography>
                </DialogContent>
            )}

            {settings.remoteControl && (
                <>
                    <DialogContent
                        sx={{
                            maxWidth: 400,
                            display: "flex",
                            justifyContent: "center",
                            flexDirection: "column",
                            gap: 2,
                            alignItems: "center",
                            textAlign: "center",
                        }}
                    >
                        <QRCode
                            value={url}
                            style={{
                                opacity: url ? 1 : 0,
                                transition: theme.transitions.create("opacity"),
                            }}
                        />

                        <Typography color="text.secondary">
                            Scan this QR code with your phone to connect or share the link
                        </Typography>

                        {!navigator.share && (
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={async () => {
                                    await navigator.clipboard.writeText(url);
                                }}
                            >
                                copy link
                            </Button>
                        )}

                        {navigator.share && (
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    navigator.share({
                                        title: "Academy Game Remote",
                                        text: game.players.map((player) => player.username).join(", "),
                                        url: url,
                                    });
                                }}
                            >
                                share link
                            </Button>
                        )}
                    </DialogContent>
                </>
            )}
        </Dialog>
    );
};

export default RemoteDialog;
