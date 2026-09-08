import type { FunctionComponent } from "react";

interface CrownProps extends React.HTMLAttributes<HTMLImageElement> {}

const Crown: FunctionComponent<CrownProps> = (props) => {
  return <img src="/crown.svg" alt="Crown" {...props} />;
};

interface JesterProps extends React.HTMLAttributes<HTMLImageElement> {}

const Jester: FunctionComponent<JesterProps> = (props) => {
  return <img src="/jester.svg" alt="Jester" {...props} />;
};

export { Crown, Jester };
