import React, {createContext, useContext, useCallback, useState, useMemo, type ReactNode} from 'react';

type Step = {
	name: string;
	component: React.FC;
};

type StepsContextType<S> = {
	steps: Step[];
	currentIndex: number;
	currentStep: Step;
	next: () => void;
	prev: () => void;
	state: S;
	setState: React.Dispatch<React.SetStateAction<S>>;
};

const StepsContext = createContext<StepsContextType<any> | undefined>(undefined);

export function useSteps<S>() {
	const context = useContext(StepsContext as React.Context<StepsContextType<S>>);
	if (!context) {
		throw new Error('useSteps must be used within a StepsProvider');
	}

	return context;
}

export function StepsProvider<TState>({steps, children, initialState}: {steps: Step[]; children: ReactNode; initialState: TState}) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [state, setState] = useState<TState>(initialState);

	const next = useCallback(() => {
		setCurrentIndex(index => Math.min(index + 1, steps.length - 1));
	}, [steps.length]);

	const prev = useCallback(() => {
		setCurrentIndex(index => Math.max(index - 1, 0));
	}, []);

	const value = useMemo(() => ({
		steps,
		currentIndex,
		currentStep: steps[currentIndex],
		next,
		prev,
		state,
		setState,
	}), [steps, currentIndex, next, prev, state]);

	return <StepsContext.Provider value={value}>{children}</StepsContext.Provider>;
}
