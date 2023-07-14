import React from 'react';
import {StepsProvider} from '~pages/auth/useSteps';
import {RecoveryPhraseStep} from '~pages/auth/register/steps/RecoveryPhraseStep';
import {ConfirmationStep} from '~pages/auth/register/steps/ConfirmationStep';
import {useTranslation} from 'react-i18next';
import {CreatedStep} from '~pages/auth/register/steps/CreatedStep';
import {type KeySession} from '@ddnet/core';
import {Stepper} from '~pages/auth/Stepper';
import {type AuthContext} from '~pages/auth/common';
import {CreatePasswordStep} from '~pages/auth/common/CreatePasswordStep';

export type RegisterContext = AuthContext & {
	session?: KeySession;
};

export const Register: React.FC = () => {
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
