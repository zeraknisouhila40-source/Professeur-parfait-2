import type { SVGProps } from "react"

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
        <path d="M9.5 14.5v-10" />
        <path d="M9.5 8.5a4 4 0 1 1 4 4h-4" />
        <path d="M3 11l8-4 8 4-8 4-8-4z" />
        <path d="M3 11v4" />
    </svg>
  ),
};
