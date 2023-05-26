import React, {useMemo} from 'react';
import {type Point} from '~core/types';
import {type LayerStyle} from '~core/layers/shared';
import {TriangleHead} from '~core/layers/Arrow/components/heads/TriangleHead';
import {RoundHead} from '~core/layers/Arrow/components/heads/RoundHead';
import {DoubleLineHead} from '~core/layers/Arrow/components/heads/DoubleLineHead';
import {ArrowBody, ArrowBodyOverlay} from '~core/layers/Arrow/components/ArrowBody';

export enum ArrowHeadStyle {
	None = 'None',
	Triangle = 'Triangle',
	Round = 'Round',
	DoubleLine = 'DoubleLine',
}

type ArrowProps = {
	start: Point;
	end: Point;
	style: LayerStyle;
	startArrow?: ArrowHeadStyle;
	endArrow?: ArrowHeadStyle;
	selected?: boolean;
};

type ArrowHeadProps = {
	end: Point;
	rotation: number;
	size: number;
	style: LayerStyle;
	selected?: boolean;
};

export type BaseHeadArrow = {
	Component: React.FC<ArrowHeadProps> | null;
	settings: (style: LayerStyle) => {size: number; offset: number};
};

const ARROW_HEAD_MAPPING: Record<ArrowHeadStyle, BaseHeadArrow> = {
	[ArrowHeadStyle.None]: {
		Component: null,
		settings: (_: LayerStyle) => ({size: 0, offset: 0}),
	},
	[ArrowHeadStyle.Triangle]: TriangleHead,
	[ArrowHeadStyle.Round]: RoundHead,
	[ArrowHeadStyle.DoubleLine]: DoubleLineHead,
};

function getArrowSetting(arrowType: ArrowHeadStyle, style: LayerStyle) {
	const arrowHead = ARROW_HEAD_MAPPING[arrowType];
	const settings = arrowHead.settings(style);
	return {
		Component: arrowHead.Component,
		...settings,
	};
}

export const ArrowLayerComponent: React.FC<ArrowProps> = React.memo(({start, end, style, selected, startArrow = ArrowHeadStyle.None, endArrow = ArrowHeadStyle.None}) => {
	const startArrowSettings = useMemo(() => getArrowSetting(startArrow, style), [startArrow, style]);
	const endArrowSettings = useMemo(() => getArrowSetting(endArrow, style), [endArrow, style]);

	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const rotation = Math.atan2(dy, dx);

	const lineLength = Math.hypot(dx, dy) - startArrowSettings.offset - endArrowSettings.offset;

	const startOffsetX = startArrowSettings.offset * Math.cos(rotation);
	const startOffsetY = startArrowSettings.offset * Math.sin(rotation);

	const bodyStart: Point = {
		x: start.x + startOffsetX,
		y: start.y + startOffsetY,
	};

	return (
		<>
			<ArrowBody start={bodyStart} lineLength={lineLength} rotation={rotation} style={style} />
			{startArrowSettings.Component && <startArrowSettings.Component
				end={start} rotation={(rotation + Math.PI) % (2 * Math.PI)} size={startArrowSettings.size} style={style} selected={selected}
			/>}
			{endArrowSettings.Component && <endArrowSettings.Component
				end={end} rotation={rotation} size={endArrowSettings.size} style={style} selected={selected}
			/>}
			{selected && <ArrowBodyOverlay start={bodyStart} lineLength={lineLength} rotation={rotation} />}
		</>
	);
});

ArrowLayerComponent.displayName = 'ArrowLayerComponent';
