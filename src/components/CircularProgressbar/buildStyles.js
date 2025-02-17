export default function buildStyles({
  rotation,
  strokeLinecap,
  textColor,
  textSize,
  pathColor,
  pathTransition,
  pathTransitionDuration,
  trailColor,
  backgroundColor,
}) {
  const rotationTransform = rotation == null ? undefined : `rotate(${rotation}turn)`;
  const rotationTransformOrigin = rotation == null ? undefined : 'center center';

  return {
    root: {},
    path: removeUndefinedValues({
      stroke: pathColor,
      strokeLinecap: strokeLinecap,
      transform: rotationTransform,
      transformOrigin: rotationTransformOrigin,
      transition: pathTransition,
      transitionDuration: pathTransitionDuration == null ? undefined : `${pathTransitionDuration}s`,
    }),
    trail: removeUndefinedValues({
      stroke: trailColor,
      strokeLinecap: strokeLinecap,
      transform: rotationTransform,
      transformOrigin: rotationTransformOrigin,
    }),
    text: removeUndefinedValues({
      fill: textColor,
      fontSize: textSize,
    }),
    background: removeUndefinedValues({
      fill: backgroundColor,
    }),
  };
}

function removeUndefinedValues(obj) {
  Object.keys(obj).forEach((key) => {
    if (obj[key] == null) {
      delete obj[key];
    }
  });
  return obj;
}