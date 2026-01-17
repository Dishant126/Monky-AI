import { SVGProps } from "react";

const BeakerIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 16a9.065 9.065 0 0 1-6.23-.693L5 15.3m14.8 0 .38.096c1.046.263 1.82 1.222 1.82 2.386v.413c0 .818-.393 1.544-1 2.007v4.548a1.25 1.25 0 0 1-1.25 1.25h-13.5A1.25 1.25 0 0 1 5 23.75v-4.548a2.25 2.25 0 0 1-1-2.007v-.413c0-1.164.774-2.123 1.82-2.386l.38-.096"
    />
  </svg>
);

export default BeakerIcon;
