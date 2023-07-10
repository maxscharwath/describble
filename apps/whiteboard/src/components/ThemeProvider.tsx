import React from 'react';
import {useWhiteboard} from '~core/hooks';
import {shallow} from 'zustand/shallow';

export const ThemeProvider = ({children}: React.PropsWithChildren<{}>) => {
	const app = useWhiteboard();

	const settings = app.useStore(state => state.settings, shallow);
	return (
		<div data-theme={settings.darkMode ? 'dark' : 'light'} className={settings.darkMode ? 'dark' : ''}>
			{children}
		</div>
	);
};
