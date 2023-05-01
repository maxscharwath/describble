import React from 'react';
import {type WhiteboardApp} from './WhiteboardApp';

export const AppContext = React.createContext<WhiteboardApp | null>(null);

export function useApp() {
	const context = React.useContext(AppContext);
	if (!context) {
		throw new Error('useApp must be used within a AppProvider');
	}

	return context;
}
