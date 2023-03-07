import React from 'react'

export type CursorProps = {
	color: string;
	size?: number;
	label?: string;
};

export const Cursor = ({ color, size = 32, label }: CursorProps) => (
	<div className="pointer-events-none absolute drop-shadow-md">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			width={size}
			height={size}
		>
			<path
				fill={color}
				stroke="white"
				strokeWidth="1.5"
				d="M7.407 2.486c-.917-.612-2.251.046-2.152 1.238l.029.347a86.016 86.016 0 0 0 2.79 15.693c.337 1.224 2.03 1.33 2.544.195l2.129-4.697c.203-.449.697-.737 1.234-.68l5.266.564c1.209.13 2.063-1.346 1.094-2.281A90.863 90.863 0 0 0 7.703 2.684l-.296-.198Z"/>
		</svg>
		{label && <div
			className="absolute top-6 left-4 whitespace-nowrap rounded-3xl border-2 border-white px-2 py-1 text-xs text-white"
			style={{ backgroundColor: color }}>
			{label}
		</div>}
	</div>
)
