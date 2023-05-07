import React from 'react';
import {useWhiteboard} from '~core/hooks';

export const useViewport = (ref: React.RefObject<Element>) => {
	const app = useWhiteboard();
	React.useEffect(() => {
		if (!ref.current) {
			return;
		}

		const {width, height} = ref.current.getBoundingClientRect();
		app.viewport = {
			width,
			height,
		};
		const observer = new ResizeObserver(entries => {
			for (const entry of entries) {
				const {width, height} = entry.contentRect;
				app.viewport = {
					width,
					height,
				};
			}
		});
		observer.observe(ref.current);
		return () => {
			observer.unobserve(ref.current!);
		};
	}, [ref]);
};
