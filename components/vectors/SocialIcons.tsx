import React from "react";

type IconProps = React.SVGProps<SVGSVGElement>

// One family: 1.5px outline glyphs on a 24px grid, the same rounded-square frame
// (16.5px, radius 4.5) so both read at the same optical size. Stroke inherits
// currentColor; the small dots are filled to read at 20px.
const frame = { x: 3.75, y: 3.75, width: 16.5, height: 16.5, rx: 4.5 }

const Glyph = ({ children, ...props }: IconProps) => (
    <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <rect {...frame} />
        {children}
    </svg>
)

export const InstagramIcon: React.FC<IconProps> = (props) => (
    <Glyph {...props}>
        <circle cx="12" cy="12" r="3.75" />
        <circle cx="16.6" cy="7.4" r="0.9" fill="currentColor" stroke="none" />
    </Glyph>
)

export const LinkedinIcon: React.FC<IconProps> = (props) => (
    <Glyph {...props}>
        <circle cx="8.6" cy="8.1" r="0.9" fill="currentColor" stroke="none" />
        <path d="M8.6 10.9V16.4M11.9 16.4V10.9M11.9 13.6a2.35 2.35 0 0 1 4.7 0V16.4" />
    </Glyph>
)
