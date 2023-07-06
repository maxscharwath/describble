import React from 'react';
import clsx from 'clsx';
import {StepsProvider, useSteps} from '~pages/login/useSteps';
import {CreatePasswordStep} from '~pages/login/steps/CreatePasswordStep';
import {RecoveryPhraseStep} from '~pages/login/steps/RecoveryPhraseStep';
import {ConfirmationStep} from '~pages/login/steps/ConfirmationStep';

export type RegisterContext = {
	password?: string;
	phrase?: string;
};

const steps = [
	{name: 'Create password', component: CreatePasswordStep},
	{name: 'Recovery Phrase', component: RecoveryPhraseStep},
	{name: 'Confirmation', component: ConfirmationStep},
];

const Stepper: React.FC = () => {
	const {currentStep, currentIndex, steps} = useSteps();
	return (<>
		<ul className='steps'>
			{steps.map((step, index) => (
				<li key={step.name} className={clsx('step', currentIndex >= index && 'step-neutral')}>
					{step.name}
				</li>
			))}
		</ul>
		<currentStep.component/>
	</>);
};

export const RegisterContent: React.FC = () => (<div className='grid gap-4'>
	<StepsProvider steps={steps} initialState={{}}>
		<Stepper/>
	</StepsProvider>
</div>);
