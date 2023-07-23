import React from 'react';
import {useShortcuts, useWhiteboard} from '~core/hooks';
import {shallow} from 'zustand/shallow';

export const WhiteboardSettingsProvider = ({children}: React.PropsWithChildren<{}>) => {
	const app = useWhiteboard();
	useShortcuts();
	const [systemTheme, setSystemTheme] = React.useState(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
	const settings = app.useStore(state => state.settings, shallow);

	// Listen to system color scheme changes
	React.useEffect(() => {
		const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
		const listener = (event: MediaQueryListEvent) => setSystemTheme(event.matches ? 'dark' : 'light');

		mediaQueryList.addEventListener('change', listener);
		return () => mediaQueryList.removeEventListener('change', listener);
	}, []);

	React.useEffect(() => {
		if (settings.theme === 'system') {
			document.documentElement.dataset.theme = systemTheme;
		} else {
			document.documentElement.dataset.theme = settings.theme;
		}
	}, [settings, systemTheme]);

	return (
		children
	);
};
