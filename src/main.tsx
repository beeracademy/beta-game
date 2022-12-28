import ReactDOM from "react-dom/client";
import "./index.scss";
import { BrowserRouter } from "react-router-dom";
import Routes from "./routes";
import { Helmet } from "react-helmet";
import ThemeProvider from "./theme/provider";
import { CardFlashProvider } from "./components/CardFlash";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <BrowserRouter>
        <ThemeProvider>
            <CardFlashProvider>
                <Helmet>
                    <title>Academy</title>
                </Helmet>

                <Routes />
            </CardFlashProvider>
        </ThemeProvider>
    </BrowserRouter>
);
