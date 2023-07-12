import React, {type HTMLProps, memo, useMemo} from 'react';
import {getContrast, hashCode, RNG} from './utilities';

const SIZE = 36;

const DEFAULT_COLORS = ['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90'];

const eyesRendererFactory = (renderer: React.FC<EyeProps>, renderer2?: React.FC<EyeProps>): EyesRenderer => ({
	rightEye: renderer,
	leftEye: renderer2 ?? renderer,
});

const eyeTypes = {
	normal: eyesRendererFactory((props: EyeProps) => (
		<rect x={props.x + props.eyeSpread} y={props.y} width={props.eyeSize} height={2} rx={1} fill={props.eyeColor} />
	)),
	happy: eyesRendererFactory((props: EyeProps) => (
		<path
			d={`M${props.x + props.eyeSpread - props.eyeSize},${props.y + props.eyeSize} Q${props.x + props.eyeSpread},${props.y} ${props.x + props.eyeSpread + props.eyeSize},${props.y + props.eyeSize}`}
			fill='none'
			stroke={props.eyeColor}
			strokeWidth={1}
			strokeLinecap='round'
		/>
	)),
	sleepy: eyesRendererFactory((props: EyeProps) => (
		<path
			d={`M${props.x + props.eyeSpread - props.eyeSize},${props.y} Q${props.x + props.eyeSpread},${props.y + props.eyeSize} ${props.x + props.eyeSpread + props.eyeSize},${props.y}`}
			fill='none'
			stroke={props.eyeColor}
			strokeWidth={1}
			strokeLinecap='round'
		/>
	)),
	mischief: eyesRendererFactory(
		(props: EyeProps) => (
			<path
				d={`M${props.x + props.eyeSpread},${props.y} l${props.eyeSize},${props.eyeSize} l-${props.eyeSize},${props.eyeSize}`}
				fill='none'
				stroke={props.eyeColor}
				strokeWidth={1}
				strokeLinecap='round'
			/>
		),
		(props: EyeProps) => (
			<path
				d={`M${props.x + props.eyeSpread},${props.y} l-${props.eyeSize},${props.eyeSize} l${props.eyeSize},${props.eyeSize}`}
				fill='none'
				stroke={props.eyeColor}
				strokeWidth={1}
				strokeLinecap='round'
			/>
		),
	),
} satisfies Record<string, EyesRenderer>;

const mouthTypes = {
	smile: (props: MouthProps) => (
		<path
			d={`M13,${19 + props.mouthSpread} a1,0.75 0 0,0 10,0`}
			fill={props.mouthColor}
		/>
	),
	open: (props: MouthProps) => (
		<path
			d={`M15 ${19 + props.mouthSpread}c2 1 4 1 6 0`}
			stroke={props.mouthColor}
			fill='none'
			strokeLinecap='round'
		/>
	),
	surprise: (props: MouthProps) =>
		<circle cx={20} cy={19 + props.mouthSpread} r={props.mouthSize} fill={props.mouthColor} />,
	unhappy: (props: MouthProps) => (
		<path
			d={`M15 ${19 + props.mouthSpread}c2 -1 4 -1 6 0`}
			stroke={props.mouthColor}
			fill='none'
			strokeLinecap='round'
		/>
	),
};

function generateData(name?: string, colors = DEFAULT_COLORS, expression: ExpressionProps = {}): AvatarData {
	const numFromName = hashCode(name ?? crypto.randomUUID());
	const rng = new RNG(numFromName);
	const wrapperColor = rng.nextChoice(colors);
	const preTranslateX = rng.nextUnit(10, true);
	const wrapperTranslateX = preTranslateX < 5 ? preTranslateX + (SIZE / 9) : preTranslateX;
	const preTranslateY = rng.nextUnit(10, true);
	const wrapperTranslateY = preTranslateY < 5 ? preTranslateY + (SIZE / 9) : preTranslateY;
	const eyeType = expression.eye ?? rng.nextChoice(Object.keys(eyeTypes)) as keyof typeof eyeTypes;
	const mouthType = expression.mouth ?? rng.nextChoice(Object.keys(mouthTypes)) as keyof typeof mouthTypes;

	return {
		wrapperColor,
		faceColor: getContrast(wrapperColor),
		backgroundColor: rng.nextChoice(colors),
		wrapperTranslateX,
		wrapperTranslateY,
		wrapperRotate: rng.nextUnit(360, false),
		wrapperScale: 1 + (rng.nextUnit(SIZE / 12, false) / 10),
		isCircle: rng.nextBoolean(),
		eyeSpread: rng.nextUnit(5, false),
		eyeSize: 1.5 + rng.nextUnit(1, false),
		mouthSpread: rng.nextUnit(5, false),
		mouthSize: 1.5 + rng.nextUnit(1, true),
		faceRotate: rng.nextUnit(10, true),
		faceTranslateX: wrapperTranslateX > SIZE / 6 ? wrapperTranslateX / 2 : rng.nextUnit(8, true),
		faceTranslateY: wrapperTranslateY > SIZE / 6 ? wrapperTranslateY / 2 : rng.nextUnit(7, true),
		eyeType,
		mouthType,
	};
}

export const Moodie = memo(({name, colors, size, title, square, expression, ...props}: MoodieProps & Omit<HTMLProps<SVGSVGElement>, keyof MoodieProps>) => {
	const data = useMemo(() => generateData(name, colors, expression), [name, colors, expression]);
	const maskID = React.useId();

	return (
		<svg
			viewBox={`0 0 ${SIZE} ${SIZE}`}
			fill='none'
			role='img'
			xmlns='http://www.w3.org/2000/svg'
			width={size}
			height={size}
			{...props}
		>
			{title && <title>{title}</title>}
			<mask id={maskID} maskUnits='userSpaceOnUse' x={0} y={0} width={SIZE} height={SIZE}>
				<rect width={SIZE} height={SIZE} rx={square ? undefined : SIZE * 2} fill='#FFFFFF' />
			</mask>
			<g mask={`url(#${maskID})`}>
				<rect width={SIZE} height={SIZE} fill={data.backgroundColor} />
				<rect
					x='0'
					y='0'
					width={SIZE}
					height={SIZE}
					transform={`translate(${data.wrapperTranslateX} ${data.wrapperTranslateY}) rotate(${data.wrapperRotate} ${SIZE / 2} ${SIZE / 2}) scale(${data.wrapperScale})`}
					fill={data.wrapperColor}
					rx={data.isCircle ? SIZE : SIZE / 6}
				/>
				<g
					transform={`translate(${data.faceTranslateX} ${data.faceTranslateY}) rotate(${data.faceRotate} ${SIZE / 2} ${SIZE / 2})`}
				>
					{eyeTypes[data.eyeType].leftEye({eyeSize: data.eyeSize, eyeSpread: data.eyeSpread, eyeColor: data.faceColor, x: 20, y: 14})}
					{eyeTypes[data.eyeType].rightEye({eyeSize: data.eyeSize, eyeSpread: -data.eyeSpread, eyeColor: data.faceColor, x: 14, y: 14})}
					{mouthTypes[data.mouthType]({mouthSpread: data.mouthSpread, mouthSize: data.mouthSize, mouthColor: data.faceColor})}
				</g>
			</g>
		</svg>
	);
});

Moodie.displayName = 'Moodie';

type ExpressionProps = {
	eye?: keyof typeof eyeTypes;
	mouth?: keyof typeof mouthTypes;
};

type MoodieProps = {
	name?: string;
	colors?: string[];
	size?: string | number;
	title?: string;
	square?: boolean;
	expression?: ExpressionProps;
};

type AvatarData = {
	wrapperColor: string;
	faceColor: string;
	backgroundColor: string;
	wrapperTranslateX: number;
	wrapperTranslateY: number;
	wrapperRotate: number;
	wrapperScale: number;
	isCircle: boolean;
	eyeSpread: number;
	eyeSize: number;
	mouthSpread: number;
	mouthSize: number;
	faceRotate: number;
	faceTranslateX: number;
	faceTranslateY: number;
	eyeType: keyof typeof eyeTypes;
	mouthType: keyof typeof mouthTypes;
};

type EyeProps = {
	eyeSize: number;
	eyeSpread: number;
	eyeColor: string;
	x: number;
	y: number;
};

type MouthProps = {
	mouthSpread: number;
	mouthSize: number;
	mouthColor: string;
};

type EyesRenderer = {
	rightEye: React.FC<EyeProps>;
	leftEye: React.FC<EyeProps>;
};
