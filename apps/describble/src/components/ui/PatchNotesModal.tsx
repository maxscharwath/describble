import React from 'react';
import {useTranslation} from 'react-i18next';
import * as Dialog from '@radix-ui/react-dialog';
import {GithubIcon, VerifiedIcon} from 'ui/components/Icons';

type CommitData = {
	sha: string;
	node_id: string;
	commit: Commit;
	url: string;
	html_url: string;
	comments_url: string;
	author: GithubAuthor;
	committer: GithubAuthor;
	parents: Parent[];
};

type GithubAuthor = {
	login: string;
	id: number;
	node_id: string;
	avatar_url: string;
	gravatar_id: string;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: string;
	site_admin: boolean;
};

type Commit = {
	author: CommitAuthor;
	committer: CommitAuthor;
	message: string;
	tree: Tree;
	url: string;
	comment_count: number;
	verification: Verification;
};

type CommitAuthor = {
	name: string;
	email: string;
	date: string;
};

type Tree = {
	sha: string;
	url: string;
};

type Verification = {
	verified: boolean;
	reason: string;
	signature: string;
	payload: string;
};

type Parent = {
	sha: string;
	url: string;
	html_url: string;
};

export const PatchNotesModal = ({children}: React.PropsWithChildren<{}>) => {
	const githubRepo = 'maxscharwath/describble';
	const {t, i18n} = useTranslation();
	const [commitIndex, setCommitIndex] = React.useState(0); // The index of the currently displayed commit
	const [commitData, setCommitData] = React.useState<CommitData[]>([]); // The list of fetched commit data
	const [loading, setLoading] = React.useState(false); // Whether the commits are currently being fetched
	const fetchCommits = React.useCallback(() => {
		if (loading) {
			return;
		}

		setLoading(true);
		fetch(`https://api.github.com/repos/${githubRepo}/commits?per_page=100`)
			.then(async response => response.json())
			.then((data: CommitData[]) => setCommitData(data))
			.catch(error => console.error('Error:', error))
			.finally(() => setLoading(false));
	}, [loading]);

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
		<Dialog.Root onOpenChange={open => open && fetchCommits()}>
			<Dialog.Trigger asChild>{children}</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Content className='modal modal-bottom data-[state=open]:modal-open sm:modal-middle'
					onOpenAutoFocus={e => e.preventDefault()}>
					<div className='modal-box grid gap-4'>
						<Dialog.Title className='card-title'>{t('patch_notes.title')}</Dialog.Title>
						{loading
							? (<div className='flex animate-pulse items-center gap-3'>
								<div className='avatar w-16'>
									<div className='h-16 w-16 rounded-xl bg-base-content/50'/>
								</div>
								<div className='flex w-full flex-col gap-2'>
									<div className='flex items-center justify-between gap-2'>
										<div className='h-3 w-1/2 rounded-full bg-base-content/50'/>
										<div className='h-3 w-1/3 rounded-full bg-base-content/50'/>
									</div>
									<div className='h-3 w-2/3 rounded-full bg-base-content/50'/>
								</div>
							</div>)
							: (
								<div className='flex items-center gap-3'>
									<div className='avatar indicator w-16'>
										<img className='rounded-xl' src={commitData[commitIndex]?.committer.avatar_url} />
										{commitData[commitIndex]?.commit.verification.verified && <VerifiedIcon className='indicator-item h-5 w-5 text-success' />}
									</div>
									<div className='flex w-full flex-col'>
										<div className='flex items-center justify-between'>
											<h3 className='text-md truncate font-bold'>{commitData[commitIndex]?.commit.author.name}</h3>
											<time className='text-sm text-base-content/70' dateTime={commitData[commitIndex]?.commit.committer.date}>
												{new Date(commitData[commitIndex]?.commit.committer.date)
													.toLocaleDateString(i18n.language, {
														month: 'long',
														day: 'numeric',
														year: 'numeric',
													})}
											</time>
										</div>
										<p className='truncate font-mono text-xs text-gray-500'>{commitData[commitIndex]?.sha}</p>
									</div>
								</div>
							)}

						<div className='divider my-0' />

						{loading
							? (<div className='flex animate-pulse flex-col items-start gap-3'>
								<div className='h-3 w-1/2 rounded-full bg-base-content/50'/>
								<div className='h-3 w-1/3 rounded-full bg-base-content/50'/>
								<div className='h-3 w-2/3 rounded-full bg-base-content/50'/>
							</div>)
							: (
								<pre className='max-h-96 overflow-y-auto whitespace-pre-wrap break-words text-sm'>
									{commitData[commitIndex]?.commit.message}
								</pre>
							)}

						<a href={`https://github.com/${githubRepo}/commit/${commitData[commitIndex]?.sha}`}
							className='btn btn-primary' target='_blank'
							rel='noopener noreferrer'>
							{t('patch_notes.view_on_github')} <GithubIcon className='h-4 w-4'/>
						</a>

						<div className='flex justify-between gap-2'>
							<div className='join grid grid-cols-2'>
								<button onClick={handlePrevious} className='btn btn-outline join-item'
									disabled={commitIndex >= commitData.length - 1}>
									{t('btn.previous')}
								</button>
								<button onClick={handleNext} className='btn btn-outline join-item' disabled={commitIndex <= 0}>
									{t('btn.next')}
								</button>
							</div>
							<Dialog.Close asChild>
								<button className='btn btn-ghost'>{t('btn.close')}</button>
							</Dialog.Close>
						</div>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};
