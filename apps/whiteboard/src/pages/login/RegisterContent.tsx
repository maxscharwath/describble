import React from 'react';
import clsx from 'clsx';
import {StepsProvider, useSteps} from '~pages/login/useSteps';
import {CreatePasswordStep} from '~pages/login/steps/CreatePasswordStep';
import {RecoveryPhraseStep} from '~pages/login/steps/RecoveryPhraseStep';
import {ConfirmationStep} from '~pages/login/steps/ConfirmationStep';
import {useTranslation} from 'react-i18next';
import {CreatedStep} from '~pages/login/steps/CreatedStep';
import {type KeySession} from 'ddnet/src/keys/SessionManager';

export type RegisterContext = {
	password?: string;
	phrase?: string;
	session?: KeySession;
};

const Stepper: React.FC = () => {
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

export const RegisterContent: React.FC = () => {
	const {t} = useTranslation();

	const steps = [
		{name: t('register.step.create_password'), component: CreatePasswordStep},
		{name: t('register.step.recovery_phrase'), component: RecoveryPhraseStep},
		{name: t('register.step.confirmation'), component: ConfirmationStep},
		{name: t('register.step.created'), component: CreatedStep, hidden: true},
	];

	return (<div className='grid gap-4'>
		<StepsProvider steps={steps} initialState={{}}>
			<Stepper/>
		</StepsProvider>
	</div>);
};
