import React, {useEffect} from 'react';
import {useMouseState, useWhiteboard} from '~core/hooks';
import {Cursor, type CursorRef} from 'ui';
import {type DocumentPresence} from 'ddnet';

type MouseState = {
	x: number;
	y: number;
	clicked: boolean;
	visible: boolean;
	ref: React.RefObject<CursorRef>;
};

const randomColor = (id: string) => {
	const hash = id.split('').reduce((a, b) => {
		a = (a << 5) - a + b.charCodeAt(0);
		return a & a;
	}, 0);
	return `hsl(${hash % 360}, 100%, 50%)`;
};

export const Cursors = () => {
	const app = useWhiteboard();
	const [mousesState, setMousesState] = React.useState<Map<string, MouseState>>(new Map());
	useEffect(() => {
		const presence = app.presence as DocumentPresence<MouseState>;
		const unsubscribe = presence.on('update', map => {
			let changed = false;
			map.forEach(presenceMessage => {
				let mouse = mousesState.get(presenceMessage.peerId);
				if (mouse) {
					mouse.ref.current?.update({
						...presenceMessage.presence,
						...app.getScreenPoint(presenceMessage.presence),
					});
				} else {
					mouse = {
						...presenceMessage.presence,
						ref: React.createRef(),
					};
					mousesState.set(presenceMessage.peerId, mouse);
					changed = true;
				}
			});

			mousesState.forEach((mouse, id) => {
				if (!map.has(id)) {
					mousesState.delete(id);
					changed = true;
				}
			});

			if (changed) {
				setMousesState(new Map(mousesState));
			}
		});
		return () => {
			unsubscribe();
		};
	}, [app.presence]);

	useMouseState(state => {
		const pos = app.getCanvasPoint(state);
		app.presence.sendPresenceMessage({
			x: pos.x,
			y: pos.y,
			clicked: state.clicked,
			visible: !state.outside,
		});
	});

	React.useLayoutEffect(() => {
		const size = 32;
		const color = randomColor('yolo');
		const svgCursor = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='${size}' height='${size}'><path fill='${color}' stroke='white' stroke-width='1.5' d='M7.407 2.486c-.917-.612-2.251.046-2.152 1.238l.029.347a86.016 86.016 0 0 0 2.79 15.693c.337 1.224 2.03 1.33 2.544.195l2.129-4.697c.203-.449.697-.737 1.234-.68l5.266.564c1.209.13 2.063-1.346 1.094-2.281A90.863 90.863 0 0 0 7.703 2.684l-.296-.198Z'/></svg>`;
		const cursor = `url("data:image/svg+xml,${encodeURIComponent(svgCursor)}") ${size / 4} ${size / 6}, default`;
		document.body.style.setProperty('--cursor', cursor);
	}, []);

	return (
		<>
			{Array.from(mousesState).map(([id, mouse]) => (
				<Cursor
					key={id}
					x={mouse.x}
					y={mouse.y}
					clicked={mouse.clicked}
					color={randomColor(id)}
					ref={mouse.ref}
					label={id}
					interpolate={true}
				/>
			))}
		</>
	);
};
