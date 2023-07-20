import React from 'react';
import {useShortcuts, useWhiteboard} from '~core/hooks';
import {shallow} from 'zustand/shallow';

export const WhiteboardSettingsProvider = ({children}: React.PropsWithChildren<{}>) => {
	const app = useWhiteboard();
	useShortcuts();
	const settings = app.useStore(state => state.settings, shallow);
	React.useEffect(() => {
		document.documentElement.dataset.theme = settings.darkMode ? 'dark' : 'light';
	}, [settings]);

	return children;
};
