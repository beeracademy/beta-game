import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Fade,
  useTheme,
} from "@mui/material";
import { FunctionComponent } from "react";
import { Helmet } from "react-helmet";
import NewGameForm from "./components/Form";
import ShuffleDialog from "./components/ShuffleDialog";
import { NewGameProvider } from "./contexts/newGame";

const NewGameView: FunctionComponent = () => {
  const theme = useTheme();

  return (
    <NewGameProvider>
      <Helmet>
        <title>Academy - New Game</title>
      </Helmet>

      <Fade in={true}>
        <Card
          sx={{
            padding: 1,
            width: 600,
            zIndex: 10,

            [theme.breakpoints.down("md")]: {
              height: "100vh",
              width: "100vw",
              padding: 0,
              borderRadius: 0,
              overflowY: "auto",
            },
          }}
        >
          <CardHeader title="New Game" />

          <Divider
            sx={{
              marginLeft: 2,
              marginRight: 2,
            }}
          />

          <CardContent>
            <NewGameForm />
          </CardContent>
        </Card>
      </Fade>

      <ShuffleDialog open={false} />
    </NewGameProvider>
  );
};

export default NewGameView;
