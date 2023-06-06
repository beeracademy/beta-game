import { FunctionComponent, ReactNode } from "react";

interface ConditionalProps {
  value: boolean;
  children: ReactNode | ReactNode[];
}

const Conditional: FunctionComponent<ConditionalProps> = (props) => {
  return <>{props.value && props.children}</>;
};

export default Conditional;
