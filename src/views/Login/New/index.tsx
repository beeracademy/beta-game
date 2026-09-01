import { Card, CardContent, CardHeader, Divider, Fade } from "@mui/material";
import type { FunctionComponent } from "react";
import { Helmet } from "react-helmet-async";
import LoginHeaderActions from "../components/LoginHeaderActions";
import NewGameForm from "./components/Form";
import { NewGameProvider, useNewGame } from "./contexts/newGame";

const NewGameCard: FunctionComponent = () => {
	const newGame = useNewGame();

	return (
		<Fade in={true}>
			<Card
				sx={{
					width: newGame.wide
						? { xs: "100%", sm: "min(92vw, 720px)", md: "min(90vw, 760px)" }
						: { xs: "100%", sm: 580, md: 600 },
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
					title={newGame.title}
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
	);
};

const NewGameView: FunctionComponent = () => {
	return (
		<NewGameProvider>
			<Helmet>
				<title>Academy - New Game</title>
			</Helmet>

			<NewGameCard />
		</NewGameProvider>
	);
};

export default NewGameView;
