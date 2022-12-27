import { Button, Dialog, DialogActions, DialogContent, DialogProps, Stack, Typography } from "@mui/material";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import ReactConfetti from "react-confetti";
import { useSounds  }from "../../../hooks/sounds";
import { milisecondsToMMSSsss } from "../../../utilities/time";

interface ChugDialogProps extends DialogProps {}

const ChugDialog: FunctionComponent<ChugDialogProps> = (props) => {
    const sounds = useSounds();

    const buttonRef = useRef<HTMLButtonElement>(null);

    const [elapsedTime, setElapsedTime] = useState(0);
    const [running, setRunning] = useState(false);

    const [intervalRef, setIntervalRef] = useState<ReturnType<typeof setInterval>>();

    const start = () => {
        if (elapsedTime) {
            return;
        }

        setRunning(true);
        sounds.play("bubbi_fuve");

        const startTime = Date.now();

        const ref = setInterval(() => {
            setElapsedTime(Date.now() - startTime);
        }, 1);

        setIntervalRef(ref);
    };

    const stop = () => {
        if (intervalRef) {
            clearInterval(intervalRef);
        }

        sounds.stopAll();
        setRunning(false);

        playFinishSound();

        props.onClose?.({}, "backdropClick");
    };

    const reset = () => {
        setElapsedTime(0);
        setRunning(false);

        setTimeout(() => {
            buttonRef.current?.focus();
        }, 0);
    };

    const playFinishSound = () => {
        if (elapsedTime < 5000) {
            //   this.flashService.flashText("FlAWLESS VICTORY!");
            sounds.play("mkd_flawless");
        } else if (elapsedTime < 7000) {
            //   this.flashService.flashText("FATALITY!");
            sounds.play("mkd_fatality");
        } else if (elapsedTime < 20000) {
            sounds.play("mkd_laugh");
        } else {
            sounds.play("humiliation");
        }
    };

    useEffect(() => {
        if (props.open) {
            reset();
        }
    }, [props.open]);

    return (
        <>
            {props.open && <ReactConfetti />}

            <Dialog
                {...props}
                onClose={() => {
                    buttonRef.current?.focus();
                }}
                onClick={() => {
                    buttonRef.current?.focus();
                }}
            >
                <DialogContent
                    sx={{
                        textAlign: "center",
                    }}
                >
                    <Stack spacing={1}>
                        <Typography fontSize={36}>Player1 chug!</Typography>

                        <Typography fontSize={100}>{milisecondsToMMSSsss(elapsedTime)}</Typography>

                        <Typography fontSize={24} color="text.secondary">
                            best {milisecondsToMMSSsss(199923)} from season 10
                        </Typography>
                    </Stack>
                </DialogContent>

                <DialogActions
                    sx={{
                        padding: 2,
                    }}
                >
                    <Button
                        disableRipple
                        ref={buttonRef}
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{
                            height: 64,
                            fontSize: 32,
                            fontWeight: "bold",
                        }}
                        onKeyDownCapture={(e) => {
                            if (e.code === "Space") {
                                e.preventDefault();
                                e.stopPropagation();

                                running ? stop() : start();
                            }
                        }}
                        onClick={(e) => {
                            e.stopPropagation();

                            running ? stop() : start();
                        }}
                    >
                        {running ? "Stop" : "Start"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ChugDialog;
