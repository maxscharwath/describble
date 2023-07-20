import React from 'react';
import {DescribbleLogo} from '~components/ui/DescribbleLogo';
import {abbreviatedSha} from '~build/info';
import {GithubIcon} from 'ui/components/Icons';
import {Outlet} from 'react-router-dom';

const githubUrl = 'https://github.com/maxscharwath/describble';

export function BaseLayout() {
	return (
		<div className='flex min-h-screen flex-col gap-4 pt-4 portrait:standalone:pt-14'>
			<div className='flex grow flex-col items-center p-4'>
				<Outlet />
			</div>
			<footer className='footer flex items-center justify-between bg-base-200 px-4 py-3 text-xs text-base-content'>
				<div className='flex items-center gap-2'>
					<DescribbleLogo small className='h-6 w-6' />
					<div>
						<p>© {new Date().getFullYear()} Describble</p>
						<a
							href={`${githubUrl}/commit/${abbreviatedSha}`}
							className='text-base-content/70 hover:underline'
							target='_blank'
							rel='noopener noreferrer'
						>
            Build: <span className='font-mono'>{abbreviatedSha}</span>
						</a>
					</div>
				</div>
				<div>
					<a href={githubUrl} className='btn-ghost btn-circle btn'>
						<GithubIcon className='h-6 w-6' />
					</a>
				</div>
			</footer>
		</div>
	);
}
