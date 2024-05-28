import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { FunctionComponent } from "react";
import { useSounds } from "../../../hooks/sounds";
import useGame from "../../../stores/game";
interface DNFDialogProps extends DialogProps {}

const DNFDialog: FunctionComponent<DNFDialogProps> = (props) => {
  const { players, dnf_player_ids, SetPlayerDNF } = useGame((state) => ({
    players: state.players,
    dnf_player_ids: state.dnf_player_ids,
    SetPlayerDNF: state.SetPlayerDNF,
  }));

  const sound = useSounds();

  const toggle = (index: number) => {
    sound.play("click");

    const player = players[index];

    if (player.id === undefined) {
      return;
    }

    const isDNF = dnf_player_ids.includes(player.id);

    console.log("Setting DNF for player", player.id, !isDNF);

    SetPlayerDNF(player.id, !isDNF);
  };

  return (
    <Dialog {...props}>
      <DialogTitle textAlign="center" variant="h4">
        Did not finish?
      </DialogTitle>

      <DialogContent
        sx={{
          textAlign: "center",
          minWidth: 500,
        }}
      >
        <DialogContentText>
          Mark players who did not finish the game.
        </DialogContentText>

        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{
            marginTop: 4,
          }}
        >
          {players.map((player, index) => {
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: 1,
                  borderRadius: (t) => `${t.shape.borderRadius}px`,
                }}
                component={ButtonBase}
                onClick={() => toggle(index)}
              >
                <Avatar
                  src={player.image}
                  sx={{
                    width: 64,
                    height: 64,
                  }}
                />

                <Typography
                  key={player.id}
                  variant="caption"
                  sx={{
                    maxWidth: 64,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {player.username}
                </Typography>

                {dnf_player_ids.includes(player.id || 0) && <PlayerCross />}
              </Box>
            );
          })}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          padding: 2,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={() => props.onClose?.({}, "escapeKeyDown")}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const PlayerCross: FunctionComponent = () => {
  const theme = useTheme();

  return (
    <svg
      width="90"
      height="90"
      viewBox="0 0 269 310"
      style={{
        position: "absolute",
        top: -8,
      }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M232.072 1.42019C224.884 4.54119 218.576 10.5842 204.1 28.2172C187.527 48.4062 174.94 64.8342 174.94 66.2772C174.94 67.4922 166.156 77.3412 158.07 85.1942C150.147 92.8872 138.492 106.895 135.984 111.738C134.947 113.741 131.687 117.742 128.74 120.628C123.381 125.877 123.381 125.877 112.41 112.631C83.483 77.7052 66.563 61.0502 53.295 54.4422C50.465 53.0332 47.09 51.8782 45.795 51.8762C44.5 51.8742 41.226 50.7492 38.521 49.3762C35.815 48.0032 33.018 46.8802 32.306 46.8802C30.555 46.8802 28.94 50.1152 28.94 53.6232C28.94 55.2042 28.342 57.3162 27.611 58.3152C26.421 59.9422 25.903 59.9962 22.677 58.8292C19.865 57.8132 18.754 57.7902 17.626 58.7262C16.649 59.5372 14.349 59.7112 10.532 59.2622C7.42504 58.8972 4.64503 58.2112 4.35303 57.7392C4.06103 57.2672 2.88703 56.8802 1.74503 56.8802C-0.156967 56.8802 -0.276959 57.2812 0.315041 61.6302C0.670041 64.2422 2.06904 68.6502 3.42304 71.4242C8.00004 80.7992 44.18 123.247 49.483 125.462C51.175 126.169 53.084 127.901 53.727 129.312C54.37 130.722 56.629 133.79 58.749 136.128C60.868 138.467 65.227 143.98 68.435 148.38C71.643 152.78 77.569 159.541 81.604 163.405C85.639 167.268 88.94 170.742 88.94 171.124C88.94 171.506 85.606 176.082 81.532 181.295C77.458 186.507 71.307 194.958 67.864 200.076C63.66 206.323 57.358 213.519 48.68 221.978C35.883 234.451 35.742 234.638 34.33 240.978C33.546 244.499 32.412 250.305 31.81 253.88C30.918 259.174 30.09 260.988 27.346 263.66C24.011 266.908 23.98 267.019 24.209 275.16C24.502 285.591 23.135 288.496 12.736 299.536C8.44805 304.088 4.94004 308.278 4.94004 308.846C4.94004 309.415 6.20204 309.88 7.74404 309.88C14.946 309.88 31.117 295.894 90.44 238.356C105.84 223.419 120.066 209.785 122.052 208.057C125.665 204.914 125.665 204.914 141.552 218.508C150.291 225.985 161.04 234.858 165.44 238.225C169.84 241.593 178.858 249.899 185.479 256.684C197.518 269.021 197.518 269.021 208.324 270.86C216.49 272.25 220.317 273.437 223.984 275.717C228.572 278.569 229.249 278.702 236.37 278.164C246.86 277.37 251.229 279.203 260.115 288.125C265.243 293.273 267.386 294.834 268.206 294.014C269.873 292.347 267.26 287.61 258.976 277.283C250.789 267.078 193.935 204.057 177.42 186.88C171.338 180.555 164.883 173.472 163.074 171.139C159.786 166.898 159.786 166.898 177.175 148.139C209.028 113.775 226.679 93.1032 236.142 79.0802C241.546 71.0722 247.922 58.2032 250.028 51.0512C251.082 47.4742 251.071 46.5792 249.96 45.8922C248.868 45.2182 249.033 44.0912 250.836 39.9002C252.057 37.0622 252.918 33.3082 252.748 31.5602C252.495 28.9432 251.962 28.3252 249.739 28.0682C248.254 27.8972 246.1 28.2592 244.952 28.8742C243.804 29.4882 241.949 29.7002 240.83 29.3452C239.073 28.7872 238.886 28.1612 239.461 24.7572C239.95 21.8592 239.676 20.1262 238.424 18.2152C237.248 16.4202 236.899 14.5172 237.298 12.0612C237.615 10.1062 237.408 7.94418 236.838 7.25718C236.121 6.39318 236.131 5.39219 236.871 4.01019C239.193 -0.328814 237.815 -1.07281 232.072 1.42019Z"
        fill={theme.palette.primary.main}
      />
    </svg>
  );
};

export default DNFDialog;
