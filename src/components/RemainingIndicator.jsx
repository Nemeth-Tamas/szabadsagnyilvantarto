import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const RemainingIndicator = ({ remainingDays, maxDays }) => {
  return (
    <div style={{ width: "15rem", height: "15rem" }}>
      <CircularProgressbar
        className="CircularProgressbar-inverted"
        background
        backgroundPadding={5}
        strokeWidth={6}
        value={remainingDays}
        maxValue={maxDays}
        text={`${remainingDays}/${maxDays}`}
        classes={{
          root: 'CircularProgressbar',
          trail: 'CircularProgressbar-trail',
          path: 'CircularProgressbar-path',
          text: 'CircularProgressbar-text some-additional-test-class',
          background: 'CircularProgressbar-background',
        }}
        styles={{
          background: {
            fill: '#3e98c7',
          },
        }}
      />
    </div>
  );
};

export default RemainingIndicator;