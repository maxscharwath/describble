import React, {createContext, type ReactElement, type ReactNode, useContext} from 'react';
import {useValue, type Value} from '../hooks/useValue';

export type Layer = {
	zIndex: number;
	component: (props: {transform: string}) => ReactElement;
};

const WhiteboardContext = createContext<{
	selectedColor: Value<string>;
	layers: Value<Layer[]>;
} | null>(null);

export const useWhiteboard = () => {
	const context = useContext(WhiteboardContext);
	if (!context) {
		throw new Error('useWhiteboard() must be used inside Whiteboard component');
	}

	return context;
};

export const WhiteboardProvider = ({children}: {children: ReactNode}) => {
	const selectedColor = useValue('red');
	const layers = useValue<Layer[]>([]);
	return (
		<WhiteboardContext.Provider value={{selectedColor, layers}}>
			{children}
		</WhiteboardContext.Provider>
	);
};
