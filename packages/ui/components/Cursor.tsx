import {motion, type MotionValue, useMotionValue, useSpring} from 'framer-motion';
import * as React from 'react';

export type CursorProps = {
	/**
	 * The color of the cursor
	 */
	color: string;
	/**
	 * The x position of the cursor
	 */
	x?: number;
	/**
	 * The y position of the cursor
	 */
	y?: number;
	/**
	 * Whether the cursor is currently clicking
	 */
	clicked?: boolean;
	/**
	 * The size of the cursor
	 */
	size?: number;
	/**
	 * The label of the cursor
	 */
	label?: string;
	/**
	 * Whether to interpolate the cursor position
	 */
	interpolate?: boolean;
};

export const Cursor: React.FC<CursorProps> = ({color, size = 32, label, ...props}: CursorProps) => {
	let x = useMotionValue(props.x ?? 0);
	let y = useMotionValue(props.y ?? 0);
	if (props.interpolate) {
		x = useSpring(x, {stiffness: 200, damping: 20}) as MotionValue<number>;
		y = useSpring(y, {stiffness: 200, damping: 20}) as MotionValue<number>;
	}

	React.useEffect(() => {
		x.set(props.x ?? 0);
		y.set(props.y ?? 0);
	}, [props.x, props.y]);

	return (
		<motion.div
			className='pointer-events-none absolute -mt-2 -ml-3 drop-shadow-md'
			style={{x, y, perspective: 1000}}
		>
			<motion.svg
				xmlns='http://www.w3.org/2000/svg'
				viewBox='0 0 24 24'
				width={size}
				height={size}
				animate={props.clicked ? 'clicked' : 'default'}
				variants={{
					clicked: {
						rotateX: 25,
						rotateY: -25,
					},
				}}
			>
				<path
					fill={color}
					stroke='white'
					strokeWidth='1.5'
					d='M7.407 2.486c-.917-.612-2.251.046-2.152 1.238l.029.347a86.016 86.016 0 0 0 2.79 15.693c.337 1.224 2.03 1.33 2.544.195l2.129-4.697c.203-.449.697-.737 1.234-.68l5.266.564c1.209.13 2.063-1.346 1.094-2.281A90.863 90.863 0 0 0 7.703 2.684l-.296-.198Z'/>
			</motion.svg>
			{label && <div
				className='absolute top-6 left-4 whitespace-nowrap rounded-3xl border-2 border-white px-2 py-1 text-xs text-white'
				style={{backgroundColor: color}}>
				{label}
			</div>}
		</motion.div>
	);
};
