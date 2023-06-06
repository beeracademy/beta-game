import { FunctionComponent, memo } from "react";
import { styled } from "@mui/material";

const Wrapper = styled("div")`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  .bubble {
    position: absolute;
    top: 53%;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .small {
    width: 10px;
    height: 10px;
    animation: flow 5s linear infinite;
    animation-delay: 0.1s;
  }
  .small-l {
    width: 10px;
    height: 10px;
    animation: flow 4.9s linear infinite;
    animation-delay: 0.2s;
  }
  .s-medium {
    width: 20px;
    height: 20px;
    animation: flow 4.3s linear infinite;
  }
  .medium {
    width: 25px;
    height: 25px;
    animation: flow 3.8s linear infinite;
    animation-delay: 0.3s;
  }
  .large {
    width: 5px;
    height: 5px;
    animation: flow 4.7s linear infinite;
  }

  @keyframes flow {
    0% {
      top: 90%;
      left: 50%;
      opacity: 0;
    }
    25% {
      top: 70%;
      left: 50.5%;
      opacity: 1;
    }
    50% {
      top: 50%;
      left: 50%;
      opacity: 1;
    }
    75% {
      top: 30%;
      left: 50.5%;
      opacity: 1;
    }
    100% {
      top: 10%;
      left: 50%;
      opacity: 0;
    }
  }
`;

const Bubbles: FunctionComponent = () => {
  return (
    <Wrapper>
      <div
        className="bubble small"
        style={{
          marginLeft: Math.random() * -100 + "px",
        }}
      />
      <div
        className="bubble small"
        style={{
          marginLeft: Math.random() * 100 + "px",
        }}
      />
      <div
        className="bubble s-medium"
        style={{
          marginLeft: Math.random() * 100 + "px",
        }}
      />
      <div
        className="bubble medium"
        style={{
          marginLeft: Math.random() * -100 + "px",
        }}
      />
      <div
        className="bubble large"
        style={{
          marginLeft: Math.random() * 100 + "px",
        }}
      />
      <div
        className="bubble small-l"
        style={{
          marginLeft: Math.random() * -100 + "px",
        }}
      />
    </Wrapper>
  );
};

export default memo(Bubbles);
