import { FunctionComponent } from "react";

interface BottleProps {
  color: string;
  size?: number;
}

const Bottle: FunctionComponent<BottleProps> = (props) => {
  return (
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 441.000000 1280.000000"
      preserveAspectRatio="xMidYMid meet"
      height={props.size || "30px"}
    >
      <g
        transform="translate(0.000000,1280.000000) scale(0.100000,-0.100000)"
        fill={props.color}
        stroke="#0000001f"
      >
        <path
          d="M1879 12460 c-179 -14 -362 -55 -425 -96 -40 -27 -72 -109 -89 -231
  -9 -62 -14 -117 -10 -123 3 -5 15 -10 26 -10 10 0 19 -4 19 -9 0 -6 20 -13 45
  -16 l44 -7 -39 -72 c-68 -126 -74 -196 -19 -247 l28 -26 -54 -484 c-30 -266
  -59 -513 -65 -549 -6 -36 -29 -202 -51 -370 -22 -168 -57 -433 -79 -590 -21
  -157 -55 -411 -75 -565 -40 -314 -47 -355 -81 -474 -34 -119 -65 -181 -199
  -397 -220 -353 -285 -501 -315 -719 -8 -56 -13 -999 -17 -3080 -6 -3096 -5
  -3187 33 -3388 40 -213 145 -377 285 -447 247 -125 635 -180 1279 -180 834 0
  1338 90 1538 275 72 66 103 126 146 285 l31 115 3 3040 c2 1990 -1 3086 -7
  3172 -25 327 -130 634 -306 898 -73 109 -153 262 -192 365 -65 173 -91 328
  -233 1415 -44 336 -87 642 -95 680 -14 65 -91 653 -115 882 l-11 103 40 38
  c68 65 64 137 -14 248 -42 58 -43 64 -10 64 14 0 25 5 25 10 0 6 14 10 30 10
  19 0 33 6 37 16 10 26 -14 238 -32 280 -33 79 -88 115 -223 144 -48 10 -134
  23 -192 29 -150 14 -536 21 -661 11z"
        />
      </g>
    </svg>
  );
};

export default Bottle;
