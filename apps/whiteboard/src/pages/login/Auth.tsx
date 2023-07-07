import React, {useState} from 'react';
import {DescribbleLogo} from '~components/DescribbleLogo';
import clsx from 'clsx';
import {RegisterContent} from '~pages/login/RegisterContent';
import {RecoverContent} from '~pages/login/RecoverContent';
import {useTranslation} from 'react-i18next';
import {LoginContent} from '~pages/login/LoginContent';

type TabItem = {
	id: string;
	label: string;
	content: React.ReactNode;
};

export const Auth: React.FC = () => {
	const {t} = useTranslation();

	const tabs: TabItem[] = [
		{id: 'login', label: t('nav.login'), content: <LoginContent />},
		{id: 'recover', label: t('nav.recover'), content: <RecoverContent />},
		{id: 'register', label: t('nav.register'), content: <RegisterContent />},
	];

	const [activeTab, setActiveTab] = useState<string>(tabs[0].id);

	const activeContent = tabs.find(tab => tab.id === activeTab)?.content;

	return (
		<div className='flex min-h-screen flex-col bg-gray-100 p-4'>
			<div className='card glass card-compact w-full max-w-screen-md shrink-0 self-center bg-base-100/50 shadow-xl'>
				<div className='card-body'>
					<figure>
						<DescribbleLogo className='w-full max-w-xs self-center px-4' />
					</figure>
					<div className='divider my-3' />
					<div>
						<div className='tabs -mb-px bg-transparent font-bold'>
							{tabs.map(({id, label}) => (
								<button
									key={id}
									className={clsx('tab-lifted tab border-0 sm:tab-lg', {'tab-active': activeTab === id})}
									onClick={() => setActiveTab(id)}
								>
									{label}
								</button>
							))}
							<div/>
						</div>
						<div
							className={clsx('rounded-box mb-4 border border-base-300 bg-base-100 p-4 text-base-content', activeTab === 'login' && 'rounded-tl-none')} >
							{activeContent}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
