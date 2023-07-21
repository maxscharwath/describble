import React from 'react';
import {useTranslation} from 'react-i18next';
import {StepsProvider} from '~pages/auth/useSteps';
import {Stepper} from '~pages/auth/Stepper';
import {RecoverStep} from '~pages/auth/recover/steps/RecoverStep';
import {CreatePasswordStep} from '~pages/auth/common/CreatePasswordStep';
import {ConfirmedStep} from '~pages/auth/recover/steps/ConfirmedStep';

export const Recover: React.FC = () => {
	const {t} = useTranslation();

	const steps = [
		{name: t('register.step.recovery_phrase'), component: RecoverStep},
		{name: t('register.step.create_password'), component: CreatePasswordStep},
		{name: t('register.step.confirmation'), component: ConfirmedStep},
	];

	return (<div className='grid gap-4'>
		<StepsProvider steps={steps} initialState={{}}>
			<Stepper/>
		</StepsProvider>
	</div>);
};
