import React, {useState, useCallback} from 'react';
import {useWhiteboard} from '~core/hooks';
import {useTranslation} from 'react-i18next';
import {Root, Trigger, Portal, Content, Title, Close} from '@radix-ui/react-dialog';

type EmbedProvider = {
	name: string;
	generateEmbed: (url: string) => string | false;
};

const providers = [
	{
		name: 'Spotify',
		generateEmbed(url: string) {
			const regex = /spotify\.com\/.*?(album|track|playlist)\/([A-Za-z0-9]+)/;
			const match = regex.exec(url);
			return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}` : false;
		},
	},
	{
		name: 'Youtube',
		generateEmbed(url: string) {
			const regex = /youtube\.com\/watch\?v=([A-Za-z0-9]+)/;
			const match = regex.exec(url);
			return match ? `https://www.youtube.com/embed/${match[1]}` : false;
		},
	},
	{
		name: 'Google Maps',
		generateEmbed(url: string) {
			const regex = /google\.[a-z.]{2,6}\/maps\/place\/.+?\/@([0-9.]+),([0-9.]+),/;
			const match = regex.exec(url);
			return match ? `https://maps.google.com/maps?q=${match[1]},${match[2]}&z=15&output=embed` : false;
		},
	},
	{
		name: 'Twitch',
		generateEmbed(url: string) {
			const channelRegex = /(twitch\.tv)\/(\w+)/;
			const videoRegex = /(twitch\.tv)\/videos\/(\w+)/;
			const collectionRegex = /(twitch\.tv)\/collections\/(\w+)/;

			const channelMatch = channelRegex.exec(url);
			const videoMatch = videoRegex.exec(url);
			const collectionMatch = collectionRegex.exec(url);

			const parent = document.location.hostname;
			if (videoMatch) {
				return `https://player.twitch.tv/?video=${videoMatch[2]}&parent=${parent}&autoplay=false`;
			}

			if (collectionMatch) {
				return `https://player.twitch.tv/?collection=${collectionMatch[2]}&parent=${parent}`;
			}

			if (channelMatch) {
				return `https://player.twitch.tv/?channel=${channelMatch[2]}&parent=${parent}&muted=true`;
			}

			return false;
		},
	},
	{
		name: 'Twitter',
		generateEmbed(url: string) {
			const regex = /twitter\.com\/\w+\/status\/(\d+)/;
			const match = regex.exec(url);
			return match ? `https://twitframe.com/show?url=${encodeURIComponent(url)}` : false;
		},
	},
	{
		name: 'VideoSharingSite',
		generateEmbed(url: string) {
			const regex = /([A-Za-z0-9]+\.[A-Za-z]{2,})\/view_video\.php\?viewkey=([A-Za-z0-9]+)/;
			const match = regex.exec(url);
			return match ? `https://${match[1]}/embed/${match[2]}` : false;
		},
	},
] satisfies EmbedProvider[];

const InputField = ({url, setUrl}: {url: string; setUrl: (url: string) => void}) => {
	const {t} = useTranslation();
	React.useEffect(() => {
		void navigator.clipboard.readText().then(text => setUrl(text));
	}, [setUrl]);

	return (
		<div className='form-control'>
			<input type='text'
				placeholder={t('embed.input')}
				className='input-bordered input'
				value={url}
				onChange={e => setUrl(e.target.value)} />
		</div>
	);
};

export const EmbedModal = (props: React.PropsWithChildren<{}>) => {
	const app = useWhiteboard();
	const {t} = useTranslation();
	const [url, setUrl] = useState('');
	const embed = React.useMemo(() => {
		try {
			// eslint-disable-next-line no-new -- Only used for validation
			new URL(url);
			for (const provider of providers) {
				const embed = provider.generateEmbed(url);
				if (embed) {
					return {url: embed, provider: provider.name};
				}
			}

			return {url, provider: 'unknown'};
		} catch {
			return false;
		}
	}, [url]);

	const handleSave = useCallback(() => {
		if (embed) {
			app.setTool('embed', {url: embed.url});
		}
	}, [app, embed]);

	return (
		<Root>
			<Trigger asChild>{props.children}</Trigger>
			<Portal>
				<Content className='modal modal-bottom data-[state=open]:modal-open sm:modal-middle'
					onOpenAutoFocus={e => e.preventDefault()}>
					<div className='modal-box grid gap-4'>
						<Title className='card-title'>{t('embed.title')}</Title>

						<InputField url={url} setUrl={setUrl} />

						{embed ? <iframe src={embed.url} className='card w-full overflow-hidden' />
							: <div className='alert alert-error'>
								<svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 shrink-0 stroke-current' fill='none' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' /></svg>
								<span>{t('embed.invalid')}</span>
							</div>}

						<div className='flex justify-end gap-2'>
							<Close asChild>
								<button className='btn-ghost btn'>{t('btn.cancel')}</button>
							</Close>

							<Close asChild>
								<button className='btn-primary btn' onClick={handleSave} disabled={!embed}>
									{t('embed.add')}
								</button>
							</Close>
						</div>
					</div>
				</Content>
			</Portal>
		</Root>);
};
