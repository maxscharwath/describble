import React from 'react';
import {DescribbleLogo} from '~components/ui/DescribbleLogo';
import {abbreviatedSha} from '~build/info';
import {GithubIcon, InfoIcon} from 'ui/components/Icons';
import {Outlet} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import * as Dialog from '@radix-ui/react-dialog';
import {DropdownSettings} from '~components/ui/DropdownSettings';

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
						<button className='btn-ghost btn-sm btn-circle btn'>
							<InfoIcon className='h-6 w-6' />
						</button>
					</DropdownSettings>
				</div>
			</footer>
		</div>
	);
}

type CommitData = {
	message: string;
	date: string;
	url: string;
};

const PatchNotesModal = ({children}: React.PropsWithChildren<{}>) => {
	const githubRepo = 'maxscharwath/describble';
	const {t, i18n} = useTranslation();
	const [commitIndex, setCommitIndex] = React.useState(0); // The index of the currently displayed commit
	const [commitData, setCommitData] = React.useState<CommitData[]>([]); // The list of fetched commit data

	React.useEffect(() => {
		fetch(`https://api.github.com/repos/${githubRepo}/commits?per_page=100`)
			.then(async response => response.json())
			.then((data: Array<{commit: {message: string; committer: {date: string}}; sha: string; html_url: string}>) => {
				const formattedData = data.map(commit => {
					const {message} = commit.commit;
					const {date} = commit.commit.committer;
					return {message, date, url: commit.html_url};
				});
				setCommitData(formattedData);
			})
			.catch(error => console.error('Error:', error));
	}, []);

	const handlePrevious = () => {
		if (commitIndex < commitData.length - 1) {
			setCommitIndex(commitIndex + 1);
		}
	};

	const handleNext = () => {
		if (commitIndex > 0) {
			setCommitIndex(commitIndex - 1);
		}
	};

	return (
		<Dialog.Root>
			<Dialog.Trigger asChild>{children}</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Content className='modal modal-bottom data-[state=open]:modal-open sm:modal-middle'
					onOpenAutoFocus={e => e.preventDefault()}>
					<div className='modal-box grid gap-4'>
						<Dialog.Title className='card-title'>{t('patch_notes.title')}</Dialog.Title>

						<time className='text-right text-base-content/70' dateTime={commitData[commitIndex]?.date}>
							{new Date(commitData[commitIndex]?.date).toLocaleDateString(i18n.language, {
								month: 'long',
								day: 'numeric',
								year: 'numeric',
							})}
						</time>

						<p className='max-h-96 overflow-y-auto'>
							{commitData[commitIndex]?.message}
						</p>

						<a href={commitData[commitIndex]?.url} className='btn-primary btn' target='_blank' rel='noopener noreferrer'>
							{t('patch_notes.view_on_github')} <GithubIcon className='h-4 w-4' />
						</a>

						<div className='flex justify-between gap-2'>
							<div className='join grid grid-cols-2'>
								<button onClick={handlePrevious} className='btn-outline join-item btn'>{t('btn.previous')}</button>
								<button onClick={handleNext} className='btn-outline join-item btn'>{t('btn.next')}</button>
							</div>
							<Dialog.Close asChild>
								<button className='btn-ghost btn'>{t('btn.close')}</button>
							</Dialog.Close>
						</div>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

