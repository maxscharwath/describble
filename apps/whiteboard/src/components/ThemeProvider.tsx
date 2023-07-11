import React from 'react';
import {useWhiteboard} from '~core/hooks';
import {shallow} from 'zustand/shallow';

export const ThemeProvider = ({children}: React.PropsWithChildren<{}>) => {
	const app = useWhiteboard();

	const settings = app.useStore(state => state.settings, shallow);
	React.useEffect(() => {
		document.documentElement.dataset.theme = settings.darkMode ? 'dark' : 'light';
	}, [settings]);

	return children;
};
