import { FunctionComponent } from "react";
import jester from "./jester.svg";
import crown from "./crown.svg";

interface CrownProps extends React.HTMLAttributes<HTMLImageElement> {}

const Crown: FunctionComponent<CrownProps> = (props) => {
    return <img src={crown} alt="Crown" {...props} />;
};

interface JesterProps extends React.HTMLAttributes<HTMLImageElement> {}

const Jester: FunctionComponent<JesterProps> = (props) => {
    return <img src={jester} alt="Jester" {...props} />;
};

export { Crown, Jester };
