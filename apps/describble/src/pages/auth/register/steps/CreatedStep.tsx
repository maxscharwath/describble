import React from 'react';
import {useSteps} from '~pages/auth/useSteps';
import {type RegisterContext} from '~pages/auth/register/Register';
import {useTranslation} from 'react-i18next';
import {CopyIcon} from 'ui/components/Icons';
import {useWhiteboard} from '~core/hooks';
import {useNavigate} from 'react-router-dom';
import {KeyAvatar} from '~components/ui/KeyAvatar';

export const CreatedStep: React.FC = () => {
	const {t} = useTranslation();
	const app = useWhiteboard();
	const navigate = useNavigate();
	const {state: {session, password}} = useSteps<RegisterContext>();

	if (!session) {
		return null;
	}

	const handleLogin = async () => {
		if (session.base58PublicKey && password) {
			await app.sessionManager.login(session.base58PublicKey, password);
			navigate('/');
		}
	};

	return (
		<>
			<div className='px-0 sm:px-8'>
				<div className='flex flex-col items-center'>
					<KeyAvatar value={session.base58PublicKey} className='w-24 shadow-lg ring ring-neutral ring-offset-2 ring-offset-base-100' />
					<h1 className='mt-4 text-center text-2xl font-bold'>{t('register.title_created')}</h1>
					<p className='mt-2 text-center text-base-content text-opacity-80'>{t('register.subtitle_created')}</p>
					<div className='join mt-4'>
						<button className='btn btn-neutral join-item'><CopyIcon/></button>
						<input type='text' readOnly className='input join-item input-bordered text-ellipsis text-xs' value={session.base58PublicKey} />
					</div>
				</div>
				<div className='mt-6 flex gap-4'>
					<button className='btn btn-neutral grow' onClick={handleLogin}>
						{t('btn.login')}
					</button>
				</div>
			</div>
		</>
	);
};
