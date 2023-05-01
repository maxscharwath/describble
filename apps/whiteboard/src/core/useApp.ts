import React from 'react';
import {type App} from './App';

export const AppContext = React.createContext<App>({} as App);

export function useApp() {
	return React.useContext(AppContext);
}
