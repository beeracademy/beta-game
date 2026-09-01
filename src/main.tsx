import ReactDOM from "react-dom/client";
import "./index.scss";
import { BrowserRouter } from "react-router-dom";
import Routes from "./routes";
import { Helmet, HelmetProvider } from "react-helmet-async";
import ThemeProvider from "./theme/provider";
import { CardFlashProvider } from "./components/CardFlash";
import SettingsDialog from "./components/SettingsDialog";

// Log all environment variables
console.table(import.meta.env);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <HelmetProvider>
      <ThemeProvider>
        <CardFlashProvider>
          <Helmet>
            <title>Academy</title>
          </Helmet>

          <Routes />

          <SettingsDialog />
        </CardFlashProvider>
      </ThemeProvider>
    </HelmetProvider>
  </BrowserRouter>,
);
