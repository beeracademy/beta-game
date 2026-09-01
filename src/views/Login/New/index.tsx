import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Fade,
} from "@mui/material";
import { FunctionComponent } from "react";
import { Helmet } from "react-helmet-async";
import LoginHeaderActions from "../components/LoginHeaderActions";
import NewGameForm from "./components/Form";
import ShuffleDialog from "./components/ShuffleDialog";
import { NewGameProvider } from "./contexts/newGame";

const NewGameView: FunctionComponent = () => {
  return (
    <NewGameProvider>
      <Helmet>
        <title>Academy - New Game</title>
      </Helmet>

      <Fade in={true}>
        <Card
          sx={{
            width: { xs: "100%", sm: 580, md: 600 },
            maxWidth: "100%",
            height: { xs: "100%", md: "auto" },
            maxHeight: { xs: "100%", md: "calc(100vh - 48px)" },
            display: "flex",
            flexDirection: "column",
            borderRadius: { xs: 0, sm: 2 },
            overflow: "hidden",
            zIndex: 10,
            boxShadow: (t) =>
              t.palette.mode === "dark"
                ? "0 8px 32px rgba(0, 0, 0, 0.5)"
                : "0 8px 32px rgba(0, 0, 0, 0.12)",
          }}
        >
          <CardHeader
            title="New Game"
            action={<LoginHeaderActions />}
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 20,
              backgroundColor: "background.paper",
              py: { xs: 1.5, sm: 2 },
              px: { xs: 2, sm: 3 },
              "& .MuiCardHeader-action": {
                m: 0,
                alignSelf: "center",
              },
            }}
          />

          <Divider />

          <CardContent
            sx={{
              overflowY: "auto",
              overflowX: "hidden",
              flex: 1,
              p: { xs: 2, sm: 3 },
              "&:last-child": {
                pb: { xs: 2, sm: 3 },
              },
            }}
          >
            <NewGameForm />
          </CardContent>
        </Card>
      </Fade>

      <ShuffleDialog open={false} />
    </NewGameProvider>
  );
};

export default NewGameView;
