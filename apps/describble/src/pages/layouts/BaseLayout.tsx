import React from 'react';
import {DescribbleLogo} from '~components/ui/DescribbleLogo';
import {abbreviatedSha, commitMessage, committerDate} from '~build/info';
import {GithubIcon, InfoIcon} from 'ui/components/Icons';
import {Outlet} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {Close, Content, Portal, Root, Title, Trigger} from '@radix-ui/react-dialog';

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
					<a href={githubUrl} className='btn-ghost btn-circle btn'>
						<GithubIcon className='h-6 w-6' />
					</a>
				</div>
			</footer>
		</div>
	);
}

const PatchNotesModal = ({children}: React.PropsWithChildren<{}>) => {
	const {t, i18n} = useTranslation();
	return (
		<Root>
			<Trigger asChild>{children}</Trigger>
			<Portal>
				<Content className='modal modal-bottom data-[state=open]:modal-open sm:modal-middle'
					onOpenAutoFocus={e => e.preventDefault()}>
					<div className='modal-box grid gap-4'>
						<Title className='card-title'>{t('patch_notes.title')}</Title>

						<time className='text-right text-base-content/70' dateTime={committerDate}>
							{new Date(committerDate).toLocaleDateString(i18n.language, {
								month: 'long',
								day: 'numeric',
								year: 'numeric',
							})}
						</time>

						<p className='max-h-96 overflow-y-auto'>
							{commitMessage}
						</p>

						<a href={`${githubUrl}/commit/${abbreviatedSha}`} className='btn-primary btn' target='_blank' rel='noopener noreferrer'>
							{t('patch_notes.view_on_github')} <GithubIcon className='h-4 w-4' />
						</a>

						<div className='flex justify-end gap-2'>
							<Close asChild>
								<button className='btn-ghost btn'>{t('btn.close')}</button>
							</Close>
						</div>
					</div>
				</Content>
			</Portal>
		</Root>
	);
};
