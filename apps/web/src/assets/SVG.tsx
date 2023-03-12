import React from "react";

export const LoadingSVG: React.FC<React.SVGAttributes<SVGSVGElement>> = ({
  className,
  ...props
}) => (
  <svg
    className={
      "absolute left-[calc(50%-4rem)] top-[calc(50%-4rem)] w-32 text-indigo-700" +
      (!!className ? " " + className : "")
    }
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    {...props}
  >
    <circle cx="12" cy="3.5" r="1.5" fill="currentColor" opacity="0">
      <animateTransform
        attributeName="transform"
        calcMode="discrete"
        dur="2.4s"
        repeatCount="indefinite"
        type="rotate"
        values="0 12 12;90 12 12;180 12 12;270 12 12"
      />
      <animate
        attributeName="opacity"
        dur="0.6s"
        keyTimes="0;0.5;1"
        repeatCount="indefinite"
        values="1;1;0"
      />
    </circle>
    <circle cx="12" cy="3.5" r="1.5" fill="currentColor" opacity="0">
      <animateTransform
        attributeName="transform"
        begin="0.2s"
        calcMode="discrete"
        dur="2.4s"
        repeatCount="indefinite"
        type="rotate"
        values="30 12 12;120 12 12;210 12 12;300 12 12"
      />
      <animate
        attributeName="opacity"
        begin="0.2s"
        dur="0.6s"
        keyTimes="0;0.5;1"
        repeatCount="indefinite"
        values="1;1;0"
      />
    </circle>
    <circle cx="12" cy="3.5" r="1.5" fill="currentColor" opacity="0">
      <animateTransform
        attributeName="transform"
        begin="0.4s"
        calcMode="discrete"
        dur="2.4s"
        repeatCount="indefinite"
        type="rotate"
        values="60 12 12;150 12 12;240 12 12;330 12 12"
      />
      <animate
        attributeName="opacity"
        begin="0.4s"
        dur="0.6s"
        keyTimes="0;0.5;1"
        repeatCount="indefinite"
        values="1;1;0"
      />
    </circle>
  </svg>
);

export const ArrowSVG: React.FC<React.SVGAttributes<SVGSVGElement>> = (
  props
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="m10.875 19.3l-6.6-6.6q-.15-.15-.213-.325T4 12q0-.2.063-.375t.212-.325l6.6-6.6q.275-.275.688-.287t.712.287q.3.275.313.688T12.3 6.1L7.4 11h11.175q.425 0 .713.288t.287.712q0 .425-.287.713t-.713.287H7.4l4.9 4.9q.275.275.288.7t-.288.7q-.275.3-.7.3t-.725-.3Z"
    />
  </svg>
);

export const CopySVG: React.FC<React.SVGAttributes<SVGSVGElement>> = (
  props
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M5 22q-.825 0-1.413-.588T3 20V6h2v14h11v2H5Zm4-4q-.825 0-1.413-.588T7 16V4q0-.825.588-1.413T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.588 1.413T18 18H9Zm0-2h9V4H9v12Zm0 0V4v12Z"
    />
  </svg>
);
