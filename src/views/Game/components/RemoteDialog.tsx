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
} from "@mui/material";
import { FunctionComponent, useState } from "react";
import { GoDeviceDesktop, GoDeviceMobile } from "react-icons/go";
import QRCode from "react-qr-code";
import useSettings from "../../../stores/settings";

interface RemoteDialogProps extends DialogProps {}

const RemoteDialog: FunctionComponent<RemoteDialogProps> = (props) => {
    const settings = useSettings((state) => ({
        remoteControl: state.remoteControl,
        SetRemoteControl: state.SetRemoteControl,
    }));

    const [url, setUrl] = useState("https://game.academy.beer/remote?token=1234567890");

    return (
        <Dialog {...props}>
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography
                        sx={{
                            fontSize: 20,
                        }}
                    >
                        Remote Control
                    </Typography>
                    <Switch
                        color="primary"
                        checked={settings.remoteControl}
                        onChange={(event) => {
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
                        Remote control is a feature that allows you to control the game from another device. This is
                        useful if you want to play with a large group of people and you don't want to have to pass the
                        device around.
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
                        <QRCode value={url} />

                        <Typography color="text.secondary">
                            Scan this QR code with your phone to connect or share the link
                        </Typography>

                        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                            <Button variant="contained" color="primary" onClick={
                                () => {
                                    navigator.clipboard.writeText(url);
                                }
                            }>
                                copy link
                            </Button>

                            <Button variant="contained" color="primary" onClick={
                                () => {
                                    navigator.share({
                                        title: "Academy Remote Control",
                                        text: "Game 420 with player1, player2, player3",
                                        url,
                                    });
                                }
                            }>
                                share link
                            </Button>
                        </Stack>
                    </DialogContent>
                </>
            )}
        </Dialog>
    );
};

export default RemoteDialog;
