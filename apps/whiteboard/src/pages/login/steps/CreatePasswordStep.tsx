import React, {useState, useCallback, useMemo} from 'react';
import {useSteps} from '~pages/login/useSteps';
import {type RegisterContext} from '~pages/login/RegisterContent';
import clsx from 'clsx';

export const CreatePasswordStep: React.FC = () => {
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
			return 'Password should be at least 8 characters long';
		}

		if (password !== confirmPassword) {
			return 'Passwords do not match';
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
		<p className='text-md text-center font-bold'>
			Create a password to secure your account, please note that this password cannot be recovered.
		</p>
		<div className='px-0 sm:px-8'>

			<div className='form-control'>
				<label className='label'>
					<span className='label-text'>Password</span>
				</label>
				<input
					type='password'
					placeholder='Password'
					className={clsx('input-bordered input input-md', {'input-error': error})}
					required
					minLength={8}
					value={password ?? ''} onChange={e => setPassword(e.target.value)} />

				<label className='label'>
					<span className='label-text'>Confirm Password</span>
				</label>
				<input
					type='password'
					placeholder='Confirm Password'
					className={clsx('input-bordered input input-md', {'input-error': error})}
					required
					minLength={8}
					value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
			</div>
			{error && <p className='text-red-500'>{error}</p>}
			<div className='form-control mt-6'>
				<button className='btn-neutral btn' onClick={handleNext} disabled={!isValid}>Next</button>
			</div>
		</div>
	</>);
};
