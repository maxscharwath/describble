import {motion, type MotionValue, useMotionValue, useSpring} from 'framer-motion';
import React, {useEffect, useImperativeHandle} from 'react';

type CursorState = {
	x: number;
	y: number;
	clicked: boolean;
	visible: boolean;
};

export type CursorProps = React.PropsWithChildren<{
	color: string;
	size?: number;
	label?: string;
	interpolate?: boolean;
} & Partial<CursorState>>;

export type CursorRef = {
	update: (point: Partial<CursorState>) => void;
};

const springConfig = {stiffness: 1000, damping: 50};

const updateMotionValue = (motionValue: MotionValue, newValue?: any) => {
	if (newValue !== undefined) {
		motionValue.set(newValue);
	}
};

type MotionValues = {
	x: MotionValue<number>;
	y: MotionValue<number>;
	rotateX: MotionValue<number>;
	rotateY: MotionValue<number>;
	opacity: MotionValue;
};

const updateMotionValues = (cursor: Partial<CursorState>, motionValues: MotionValues) => {
	const {x, y, rotateX, rotateY, opacity} = motionValues;
	updateMotionValue(x, cursor.x);
	updateMotionValue(y, cursor.y);
	updateMotionValue(rotateX, cursor.clicked ? 25 : 0);
	updateMotionValue(rotateY, cursor.clicked ? -25 : 0);
	updateMotionValue(opacity, cursor.visible ? 1 : 0);
};

export const Cursor = React.forwardRef<CursorRef, CursorProps>(
	({color, size = 32, label, children, visible = true, ...props}, ref) => {
		const motionValues = {
			x: useMotionValue(props.x ?? 0),
			y: useMotionValue(props.y ?? 0),
			rotateX: useMotionValue(props.clicked ? 25 : 0),
			rotateY: useMotionValue(props.clicked ? -25 : 0),
			opacity: useSpring(visible ? 1 : 0),
		} satisfies MotionValues;

		const [springX, springY] = [
			useSpring(motionValues.x, springConfig),
			useSpring(motionValues.y, springConfig),
		];

		useEffect(() => {
			updateMotionValues(props, motionValues);
		}, [props.x, props.y, props.clicked]);

		useImperativeHandle(ref, () => ({
			update(point) {
				updateMotionValues(point, motionValues);
			},
		}));

		const xPos = props.interpolate ? springX : motionValues.x;
		const yPos = props.interpolate ? springY : motionValues.y;

		return (
			<motion.div
				className='pointer-events-none fixed left-0 top-0 drop-shadow-md'
				style={{x: xPos, y: yPos, perspective: 1000, opacity: motionValues.opacity}}
			>
				<motion.svg
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 24 24'
					width={size}
					height={size}
					style={{translateX: -size / 4, translateY: -size / 6, rotateX: motionValues.rotateX, rotateY: motionValues.rotateY}}
				>
					<path
						fill={color}
						stroke='white'
						strokeWidth='1.5'
						d='M7.407 2.486c-.917-.612-2.251.046-2.152 1.238l.029.347a86.016 86.016 0 0 0 2.79 15.693c.337 1.224 2.03 1.33 2.544.195l2.129-4.697c.203-.449.697-.737 1.234-.68l5.266.564c1.209.13 2.063-1.346 1.094-2.281A90.863 90.863 0 0 0 7.703 2.684l-.296-.198Z'/>
				</motion.svg>
				<div
					className='absolute bottom-1/2 right-2/3 translate-x-full translate-y-full'>
					{label
						? <span className='whitespace-nowrap rounded-3xl border-2 border-white px-2 py-1 text-xs text-white' style={{backgroundColor: color}}>{label}</span>
						: children}
				</div>
			</motion.div>
		);
	});

Cursor.displayName = 'Cursor';
