import React from 'react';
import {DescribbleLogo} from '~components/DescribbleLogo';
import clsx from 'clsx';
import {useTranslation} from 'react-i18next';
import {NavLink, Outlet} from 'react-router-dom';

export const Auth: React.FC = () => {
	const {t} = useTranslation();

	return (
		<div className='flex min-h-screen flex-col p-4'>
			<div className='card card-compact w-full max-w-screen-md shrink-0 self-center bg-base-100/50 shadow-xl'>
				<div className='card-body'>
					<figure className='mb-6'>
						<DescribbleLogo className='w-full max-w-xs self-center px-4' />
					</figure>
					<div className='rounded-box overflow-hidden border border-base-200 bg-base-200'>
						<div className='tabs -mb-px bg-transparent px-2 pt-2 font-bold'>
							<div/>
							<NavLink to='/login' className={({isActive}) => clsx('tab-lifted tab border-0 sm:tab-lg', isActive && 'tab-active')}>
								{t('nav.login')}
							</NavLink>
							<NavLink to='/recover' className={({isActive}) => clsx('tab-lifted tab border-0 sm:tab-lg', isActive && 'tab-active')}>
								{t('nav.recover')}
							</NavLink>
							<NavLink to='/register' className={({isActive}) => clsx('tab-lifted tab border-0 sm:tab-lg', isActive && 'tab-active')}>
								{t('nav.register')}
							</NavLink>
							<div/>
						</div>
						<div className={clsx('border-t border-base-300 bg-base-100 p-4 text-base-content')}>
							<Outlet />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
