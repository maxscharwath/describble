import React, {useState, useCallback, useMemo} from 'react';
import {useSteps} from '~pages/auth/useSteps';
import clsx from 'clsx';
import {useTranslation} from 'react-i18next';
import {type AuthContext} from '~pages/auth/common/index';

const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

export const CreatePasswordStep: React.FC = () => {
	const {t} = useTranslation();
	const {next, state: {password}, setState} = useSteps<AuthContext>();

	const setPassword = useCallback((password: string) => {
		setState(state => ({...state, password}));
	}, [setState]);

	const [confirmPassword, setConfirmPassword] = useState<string>('');

	const error = useMemo(() => {
		if (!password) {
			return '';
		}

		if (!passwordRegex.test(password)) {
			return t('error.password_invalid');
		}

		if (password !== confirmPassword) {
			return t('error.passwords_do_not_match');
		}

		return '';
	}, [password, confirmPassword]);

	const isValid = Boolean(password) && Boolean(confirmPassword) && !error;

	const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (isValid) {
			next();
		}
	}, [isValid, next]);

	return (<>
		<p className='text-center font-bold'>
			{t('register.subtitle_create_a_password')}
		</p>
		<form className='px-0 sm:px-8' onSubmit={handleSubmit}>

			<div className='form-control'>
				<label className='label' htmlFor='password-field'>
					<span className='label-text'>{t('input.placeholder.password')}</span>
				</label>
				<input
					type='password'
					name='password'
					id='password-field'
					autoComplete='new-password'
					placeholder={t('input.placeholder.password')}
					className={clsx('input input-bordered input-md invalid:input-error', {'input-error': error})}
					required
					pattern={passwordRegex.source}
					value={password ?? ''} onChange={e => setPassword(e.target.value)} />

				<label className='label' htmlFor='confirm-password-field'>
					<span className='label-text'>{t('input.placeholder.confirm_password')}</span>
				</label>
				<input
					type='password'
					name='confirm-password'
					id='confirm-password-field'
					autoComplete='new-password'
					placeholder={t('input.placeholder.confirm_password')}
					className={clsx('input input-bordered input-md', {'input-error': error})}
					required
					minLength={8}
					value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
			</div>
			{error && <p className='text-red-500'>{error}</p>}
			<div className='form-control mt-6'>
				<button className='btn btn-neutral' disabled={!isValid}>{t('btn.next')}</button>
			</div>
		</form>
	</>);
};
