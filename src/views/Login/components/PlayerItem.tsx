import { Avatar, Box, Divider, Skeleton, Stack, TextField, useTheme } from "@mui/material";
import { FunctionComponent, useState } from "react";
import * as AuthAPI from "../../../api/endpoints/authentication";
import { useSounds  }from "../../../hooks/sounds";

interface Player {
    username: string;
    id?: number;
    token?: string;
    image?: string;
}

interface PlayerItemProps {
    hidePassword?: boolean;
    onLoginSuccess?: (player: Player) => void;
}

const PlayerItem: FunctionComponent<PlayerItemProps> = (props) => {
    const theme = useTheme();
    const { play } = useSounds();

    const [image, setImage] = useState<string | null>(null);
    const [locked, setLocked] = useState(false);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("test");

    const login = async () => {
        if (props.hidePassword) {
            props.onLoginSuccess?.({
                username: username,
            });
            return;
        }

        setLocked(true);

        try {
            const resp = await AuthAPI.login(username, password);
            setImage(resp.image);

            props.onLoginSuccess?.({
                username: username,
                id: resp.id,
                token: resp.token,
                image: resp.image,
            });
        } catch (e) {
            console.error(e);
            play("snack");
            setPassword("");
            setLocked(false);
        }
    };

    return (
        <Box
            sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "8px",
                overflow: "hidden",
            }}
        >
            <Stack direction="row">
                <TextField
                    label="username"
                    fullWidth
                    variant="filled"
                    autoComplete="off"
                    InputProps={{
                        disableUnderline: true,
                    }}
                    sx={{
                        "& .MuiFilledInput-root": {
                            backgroundColor: "transparent",
                            borderRadius: 0,
                        },
                        "& .MuiFilledInput-root.Mui-disabled": {
                            backgroundColor: theme.palette.background.default,
                        },
                    }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={locked}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && props.hidePassword) {
                            login();
                        }
                    }}
                    onBlur={() => {
                        if (props.hidePassword) {
                            login();
                        }
                    }}
                />

                {!props.hidePassword && (
                    <>
                        <Divider orientation="vertical" flexItem />
                        <TextField
                            label="password"
                            fullWidth
                            autoComplete="off"
                            variant="filled"
                            type="password"
                            InputProps={{
                                disableUnderline: true,
                            }}
                            sx={{
                                "& .MuiFilledInput-root": {
                                    backgroundColor: "transparent",
                                    borderRadius: 0,
                                },
                                "& .MuiFilledInput-root.Mui-disabled": {
                                    backgroundColor: theme.palette.background.default,
                                },
                            }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={login}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    login();
                                }
                            }}
                            disabled={locked}
                        />
                    </>
                )}

                <Avatar
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 0,
                        backgroundColor: "#bdbdbd",
                        [theme.breakpoints.down("sm")]: {
                            display: "none",
                        },
                    }}
                    src={image || ""}
                />
            </Stack>
        </Box>
    );
};

export default PlayerItem;

156
263