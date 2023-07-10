import React from 'react';
import {useSteps} from '~pages/auth/useSteps';
import clsx from 'clsx';

export const Stepper: React.FC = () => {
	const {currentStep, currentIndex, steps} = useSteps();
	return (<>
		<ul className='steps'>
			{steps.filter(step => !step.hidden).map((step, index) => (
				<li key={step.name} className={clsx('step', currentIndex >= index && 'step-neutral')}>
					{step.name}
				</li>
			))}
		</ul>
		<currentStep.component/>
	</>);
};
