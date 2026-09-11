import { Fragment, type FunctionComponent } from "react";

interface FormattedTimeProps {
  value: string;
}

// AUPassata's ":" glyph sits low relative to digits; nudge it up via CSS
// (see the .time-colon rule) instead of relying on the font for alignment.
const FormattedTime: FunctionComponent<FormattedTimeProps> = ({ value }) => {
  const parts = value.split(":");

  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={`${index}-${part}`}>
          {index > 0 && <span className="time-colon">:</span>}
          {part}
        </Fragment>
      ))}
    </>
  );
};

export default FormattedTime;
