import ReactDOM from "react-dom/client";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import { CardFlashProvider } from "./components/CardFlash";
import SettingsDialog from "./components/SettingsDialog";
import { TextFlashProvider } from "./components/TextFlash";
import "./index.scss";
import Routes from "./routes";
import useLocation from "./stores/location";
import ThemeProvider from "./theme/provider";

// Log all environment variables
console.table(import.meta.env);

// Prompt for location access up front so it's available when submitting a game
useLocation.getState().RequestLocation();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<BrowserRouter>
		<HelmetProvider>
			<ThemeProvider>
				<CardFlashProvider>
					<TextFlashProvider>
						<Helmet>
							<title>Academy</title>
						</Helmet>

						<Routes />

						<SettingsDialog />
					</TextFlashProvider>
				</CardFlashProvider>
			</ThemeProvider>
		</HelmetProvider>
	</BrowserRouter>,
);
