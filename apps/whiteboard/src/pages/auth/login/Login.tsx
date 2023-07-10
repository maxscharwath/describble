import React, {useEffect, useState} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import Avatar from 'boring-avatars';
import {useWhiteboard} from '~core/hooks';
import clsx from 'clsx';
import {useNavigate} from 'react-router-dom';
import {seederCredentials} from '~seeders';

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

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (selectedPublicKey && password) {
			await app.sessionManager.login(selectedPublicKey, password);
			navigate('/');
		}
	};

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
	};

	const handleAccountChange = (e: React.MouseEvent<HTMLButtonElement>, account: string) => {
		e.preventDefault();
		if (selectedPublicKey === account) {
			return;
		}

		setPassword('');
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
								<button className={clsx(' btn-circle btn m-2 h-28 w-28', selectedPublicKey === account && 'btn-neutral')} onClick={e => handleAccountChange(e, account)}>
									<div className='avatar m-2'>
										<div className='rounded-full'>
											<Avatar
												size='100%'
												square
												name={account}
												variant='beam'
												colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
											/>
										</div>
									</div>
								</button>
							</div>
						))}
					</div>
				</div>
				<fieldset className='px-0 sm:px-8' disabled={!selectedPublicKey}>
					{selectedPublicKey === seederCredentials.key && (
						<div className='alert alert-info'>
							<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' className='h-6 w-6 shrink-0 stroke-current'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'></path></svg>
							<span>
								<Trans
									i18nKey='login.alert_demo'
									values={{
										password: seederCredentials.secret,
									}}
									components={{
										s: <b />,
									}}
								/>
							</span>
						</div>
					)}
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
						<button className='btn-neutral btn grow' disabled={!selectedPublicKey || !password}>
							{t('btn.login')}
						</button>
					</div>
				</fieldset>
			</form>
		</div>
	);
};
