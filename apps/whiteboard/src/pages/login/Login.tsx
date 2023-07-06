import React, {useState} from 'react';
import {DescribbleLogo} from '~components/DescribbleLogo';
import clsx from 'clsx';
import {RegisterContent} from '~pages/login/RegisterContent';
import {LoginContent} from '~pages/login/LoginContent';

type TabItem = {
	id: string;
	label: string;
	content: React.ReactNode;
};

const tabs: TabItem[] = [
	{id: 'login', label: 'Login', content: <LoginContent />},
	{id: 'register', label: 'Register', content: <RegisterContent />},
];

export const Login: React.FC = () => {
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
									className={clsx('tab-lifted tab tab-lg border-0', {'tab-active': activeTab === id})}
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
