import React, {useCallback, useEffect, useState} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {useWhiteboard} from '~core/hooks';
import clsx from 'clsx';
import {Link, useNavigate} from 'react-router-dom';
import {seederCredentials} from '~seeders';
import {KeyAvatar} from '~components/ui/KeyAvatar';

const useGetPublicKeys = () => {
	const app = useWhiteboard();
	const [accounts, setAccounts] = useState<string[]>([]);

	useEffect(() => {
		app.sessionManager.listKeys()
			.then(setAccounts)
			.catch(console.error);
	}, [app.sessionManager]);

	return accounts;
};

export const Login: React.FC = () => {
	const app = useWhiteboard();
	const navigate = useNavigate();
	const [t] = useTranslation();
	const accounts = useGetPublicKeys();
	const [selectedPublicKey, setSelectedPublicKey] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [loginError, setLoginError] = useState<Error | null>(null);

	const handleLogin = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (selectedPublicKey && password) {
			try {
				await app.sessionManager.login(selectedPublicKey, password);
				navigate('/');
			} catch (cause) {
				setLoginError(new Error('Could not login', {cause}));
			}
		}
	}, [password, selectedPublicKey]);

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
	};

	const handleAccountChange = (e: React.MouseEvent<HTMLButtonElement>, account: string) => {
		e.preventDefault();
		if (selectedPublicKey === account) {
			return;
		}

		setPassword('');
		setLoginError(null);
		setSelectedPublicKey(account);
	};

	return (
		<div className='grid gap-4'>
			<p className='my-2 px-0 text-center text-lg font-bold sm:px-8'>
				{t('login.subtitle_select_account')}
			</p>
			<form onSubmit={handleLogin} className='space-y-4'>
				<div className='rounded-box flex w-full items-center justify-center border border-base-200 py-2'>
					<div className='carousel-center carousel space-x-2'>
						{accounts.map((account, index) => (
							<div className='carousel-item' key={`${index}-${account}`}>
								<button type='button' className={clsx(' btn-circle btn m-2 h-28 w-28', selectedPublicKey === account && 'btn-neutral')} onClick={e => handleAccountChange(e, account)}>
									<KeyAvatar value={account} className='m-2' />
								</button>
							</div>
						))}
					</div>
				</div>
				<fieldset className='px-0 sm:px-8' disabled={!selectedPublicKey}>
					<div className='flex flex-col gap-4'>
						{loginError && (
							<div className='alert alert-error animate-pop-in' role='alert'>
								<svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 shrink-0 stroke-current' fill='none' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
								<span>{t('error.login')}</span>
								<Link className='btn-sm btn' to='/recover'>{t('btn.recover')}</Link>
							</div>
						)}
						{selectedPublicKey === seederCredentials.key && (
							<div className='alert alert-info animate-pop-in' onClick={() => setPassword(seederCredentials.secret)} role='alert'>
								<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' className='h-6 w-6 shrink-0 stroke-current'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'></path></svg>
								<span>
									<Trans
										i18nKey='login.alert_demo'
										values={{
											password: seederCredentials.secret,
										}}
										components={{
											s: <span className='badge badge-neutral'/>,
										}}
									/>
								</span>
							</div>
						)}
					</div>
					<div className='flex flex-col gap-4'>
						<div className='form-control w-full'>
							<label className='label' htmlFor='username-field'>
								<span className='label-text'>{t('input.placeholder.public_key')}</span>
							</label>
							<input type='text' autoComplete='username' name='username' id='username-field' readOnly className='input-bordered input' value={selectedPublicKey} placeholder={t('input.placeholder.public_key')} />
						</div>
						<div className='form-control w-full'>
							<label className='label' htmlFor='password-field'>
								<span className='label-text'>{t('input.placeholder.password')}</span>
							</label>
							<input type='password' name='password' id='password-field' autoComplete='current-password' className='input-bordered input' placeholder={t('input.placeholder.password')} value={password} onChange={handlePasswordChange} />
						</div>
						<button type='submit' className='btn-neutral btn grow' disabled={!selectedPublicKey || !password}>
							{t('btn.login')}
						</button>
					</div>
				</fieldset>
			</form>
		</div>
	);
};
