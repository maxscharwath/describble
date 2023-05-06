import React from 'react';
import {type WhiteboardApp} from '../WhiteboardApp';

const WhiteboardContext = React.createContext<WhiteboardApp | null>(null);

export function useWhiteboard() {
	const context = React.useContext(WhiteboardContext);
	if (!context) {
		throw new Error('useWhiteboard must be used within a WhiteboardProvider');
	}

	return context;
}

export const WhiteboardProvider = WhiteboardContext.Provider;
