import { styled } from "@mui/material";
import { type FunctionComponent, memo, useState } from "react";
import { swap } from "../../utilities/array";

const Wrapper = styled("div")`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  container-type: size;

  .bubble {
    position: absolute;
    top: 53%;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.3);
    will-change: transform, opacity;
  }

  .small {
    width: 10px;
    height: 10px;
    animation: flow 5s linear infinite;
  }
  .small-l {
    width: 10px;
    height: 10px;
    animation: flow 4.9s linear infinite;
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
  }
  .large {
    width: 5px;
    height: 5px;
    animation: flow 4.7s linear infinite;
  }

  /*
   * Offsets are expressed relative to the resting position of 'top: 53%', so
   * the bubbles travel from 90% down to 10% of the container height. Animating
   * 'transform' rather than 'top' keeps this on the compositor and avoids a
   * layout pass on every frame.
   */
  @keyframes flow {
    0% {
      transform: translate(-50%, 37cqh);
      opacity: 0;
    }
    25% {
      transform: translate(calc(-50% + 2px), 17cqh);
      opacity: 1;
    }
    50% {
      transform: translate(-50%, -3cqh);
      opacity: 1;
    }
    75% {
      transform: translate(calc(-50% + 2px), -23cqh);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -43cqh);
      opacity: 0;
    }
  }
`;

type BubbleVariant = {
  className: string;
  /** Must match the animation duration of the variant's class. */
  durationSeconds: number;
};

const BUBBLE_VARIANTS: BubbleVariant[] = [
  { className: "bubble small", durationSeconds: 5 },
  { className: "bubble s-medium", durationSeconds: 4.3 },
  { className: "bubble large", durationSeconds: 4.7 },
  { className: "bubble medium", durationSeconds: 3.8 },
  { className: "bubble small-l", durationSeconds: 4.9 },
  { className: "bubble small", durationSeconds: 5 },
];

const MIN_LEFT_PERCENTAGE = 8;
const MAX_LEFT_PERCENTAGE = 92;

const buildBubbles = () => {
  const count = BUBBLE_VARIANTS.length;
  const bandWidth = (MAX_LEFT_PERCENTAGE - MIN_LEFT_PERCENTAGE) / count;

  // Give every bubble its own horizontal band (with jitter inside it) so they
  // spread across the full width instead of clumping the way uniform random
  // positions tend to.
  const positions = BUBBLE_VARIANTS.map(
    (_, index) =>
      MIN_LEFT_PERCENTAGE + bandWidth * (index + 0.15 + Math.random() * 0.7),
  );

  for (let i = positions.length - 1; i > 0; i--) {
    swap(positions, i, Math.floor(Math.random() * (i + 1)));
  }

  return BUBBLE_VARIANTS.map((variant, index) => ({
    className: variant.className,
    left: `${positions[index].toFixed(2)}%`,
    // A negative delay starts the animation part-way through, staggering the
    // bubbles over the whole cycle so they don't rise as one group.
    animationDelay: `${(
      -variant.durationSeconds *
      ((index + Math.random()) / count)
    ).toFixed(2)}s`,
  }));
};

const Bubbles: FunctionComponent = () => {
  const [bubbles] = useState(buildBubbles);

  return (
    <Wrapper>
      {bubbles.map((bubble, index) => (
        <div
          key={index}
          className={bubble.className}
          style={{
            left: bubble.left,
            animationDelay: bubble.animationDelay,
          }}
        />
      ))}
    </Wrapper>
  );
};

export default memo(Bubbles);
