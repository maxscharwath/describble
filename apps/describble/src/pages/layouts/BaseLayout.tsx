import React from 'react';
import {DescribbleLogo} from '~components/ui/DescribbleLogo';
import {abbreviatedSha} from '~build/info';
import {InfoIcon} from 'ui/components/Icons';
import {Outlet} from 'react-router-dom';
import {DropdownSettings} from '~components/ui/DropdownSettings';
import {PatchNotesModal} from '~components/ui/PatchNotesModal';

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
						<PatchNotesModal>
							<button
								className='inline-flex items-center gap-1 text-base-content/70 hover:text-base-content'
							>
								Build: <span className='font-mono'>{abbreviatedSha}</span>
								<InfoIcon />
							</button>
						</PatchNotesModal>
					</div>
				</div>
				<div>
					<DropdownSettings>
						<button className='btn btn-circle btn-ghost btn-sm'>
							<InfoIcon className='h-6 w-6' />
						</button>
					</DropdownSettings>
				</div>
			</footer>
		</div>
	);
}

