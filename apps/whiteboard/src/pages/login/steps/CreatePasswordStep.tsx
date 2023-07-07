import React, {useState, useCallback, useMemo} from 'react';
import {useSteps} from '~pages/login/useSteps';
import {type RegisterContext} from '~pages/login/RegisterContent';
import clsx from 'clsx';
import {useTranslation} from 'react-i18next';

export const CreatePasswordStep: React.FC = () => {
	const {t} = useTranslation();
	const {next, state: {password}, setState} = useSteps<RegisterContext>();

	const setPassword = useCallback((password: string) => {
		setState(state => ({...state, password}));
	}, [setState]);

	const [confirmPassword, setConfirmPassword] = useState<string>('');

	const error = useMemo(() => {
		if (!password) {
			return '';
		}

		if (password.length < 8) {
			return t('error.password_too_short');
		}

		if (password !== confirmPassword) {
			return t('error.passwords_do_not_match');
		}

		return '';
	}, [password, confirmPassword]);

	const isValid = Boolean(password) && Boolean(confirmPassword) && !error;

	const handleNext = useCallback(() => {
		if (isValid) {
			next();
		}
	}, [isValid, next]);

	return (<>
		<p className='text-center font-bold'>
			{t('register.subtitle_create_a_password')}
		</p>
		<div className='px-0 sm:px-8'>

			<div className='form-control'>
				<label className='label'>
					<span className='label-text'>{t('input.placeholder.password')}</span>
				</label>
				<input
					type='password'
					placeholder={t('input.placeholder.password')}
					className={clsx('input-bordered input input-md', {'input-error': error})}
					required
					minLength={8}
					value={password ?? ''} onChange={e => setPassword(e.target.value)} />

				<label className='label'>
					<span className='label-text'>{t('input.placeholder.confirm_password')}</span>
				</label>
				<input
					type='password'
					placeholder={t('input.placeholder.confirm_password')}
					className={clsx('input-bordered input input-md', {'input-error': error})}
					required
					minLength={8}
					value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
			</div>
			{error && <p className='text-red-500'>{error}</p>}
			<div className='form-control mt-6'>
				<button className='btn-neutral btn' onClick={handleNext} disabled={!isValid}>{t('btn.next')}</button>
			</div>
		</div>
	</>);
};
