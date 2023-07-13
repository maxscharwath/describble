import {useDocument} from '~core/hooks/useDocument';
import {useSession} from '~core/hooks/useSession';
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {HashIcon, KeyIcon, ShareIcon, TrashIcon} from 'ui/components/Icons';
import {KeyAvatar} from '~components/ui/KeyAvatar';
import {base58, type Document, validatePublicKey} from 'ddnet';
import {type SyncedDocument} from '~core/managers';
import {useTranslation} from 'react-i18next';

const ShareModalContent = ({document}: {
	document: Document<SyncedDocument>;
}) => {
	const {t} = useTranslation();
	const session = useSession();
	const [publicKey, setPublicKey] = React.useState('');
	const [allowedClients, setAllowedClients] = React.useState<string[]>(document.header.allowedClients.map(client => client.base58));

	const isValidPublicKey = React.useMemo(() => {
		try {
			return validatePublicKey(base58.decode(publicKey));
		} catch (err) {
			return false;
		}
	}, [publicKey]);

	if (!session) {
		return null;
	}

	const isOwner = document.header.owner.base58 === session.base58PublicKey;

	const handleAddPublicKey = () => {
		if (!publicKey || allowedClients.some(client => client === publicKey)) {
			return;
		}

		setPublicKey('');
		setAllowedClients([...allowedClients, publicKey]);
	};

	const handleRemovePublicKey = (publicKey: string) => {
		setAllowedClients(prev => prev.filter(client => client !== publicKey));
	};

	const handleCopy = (text: string) => {
		void navigator.clipboard.writeText(text);
	};

	const handleSave = () => {
		const header = document.header.withAllowedClients(allowedClients, session.privateKey);
		document.updateHeader(header);
	};

	return 	<div className='grid gap-4'>
		<Dialog.Title className='card-title'>
			{t('share.share_settings')}
		</Dialog.Title>

		{isOwner && (
			<div className='form-control'>
				<div className='join'>
					<div className='join-item flex h-full items-center justify-center bg-base-300 p-2'>
						<KeyAvatar value={publicKey} className='w-8'/>
					</div>
					<input type='text' className='input-bordered input join-item w-full font-mono text-sm'
						placeholder={t('input.add_public_key')} value={publicKey} onChange={e => setPublicKey(e.target.value)}/>
					<button className='btn-square join-item btn' onClick={handleAddPublicKey} disabled={!isValidPublicKey}>
						<KeyIcon fontSize={20}/>
					</button>
				</div>
			</div>
		)}
		<ul className='menu rounded-box overflow-hidden bg-base-200'>
			<li>
				<details>
					<summary className='font-bold text-base-content/40'>{t('share.header')}</summary>
					<ul>
						<li>
							<div>
								<HashIcon className='w-8' />
								<div className='truncate'>
									{document.header.version}
								</div>
							</div>
						</li>
						<li onClick={() => handleCopy(document.header.address.base58)}>
							<div>
								<KeyIcon className='w-8' />
								<div className='truncate'>
									{document.header.address.base58}
								</div>
							</div>
						</li>
						<li onClick={() => handleCopy(document.header.signature.base58)}>
							<div>
								<KeyIcon className='w-8' />
								<div className='overflow-x-auto'>
									{document.header.signature.base58}
								</div>
							</div>
						</li>
					</ul>
				</details>
			</li>
			<li>
				<details open>
					<summary className='font-bold text-base-content/40'>{t('share.owner')}</summary>
					<ul>
						<li onClick={() => handleCopy(document.header.owner.base58)}>
							<div>
								<KeyAvatar value={document.header.owner.base58} className='w-8'/>
								<span className='w-full truncate font-mono text-xs'>{document.header.owner.base58}</span>
							</div>
						</li>
					</ul>
				</details>
			</li>
			{(allowedClients.length > 0) && (<li>
				<details open>
					<summary className='font-bold text-base-content/40'>{t('share.allowed_clients')}</summary>
					<ul>
						{allowedClients.map(publicKey => (
							<li key={publicKey} onClick={() => handleCopy(publicKey)}>
								<div>
									<KeyAvatar value={publicKey} className='w-8'/>
									<span className='w-full truncate font-mono text-xs'>{publicKey}</span>
									{isOwner && (
										<button className='btn-ghost btn-circle btn' onClick={() => handleRemovePublicKey(publicKey)}>
											<TrashIcon fontSize={20}/>
										</button>
									)}
								</div>
							</li>
						))}
					</ul>
				</details>
			</li>)}
		</ul>

		<div className='flex justify-end gap-2'>
			<Dialog.Close asChild>
				<button className='btn-ghost btn'>{t('btn.cancel')}</button>
			</Dialog.Close>

			<Dialog.Close asChild>
				<button className='btn-primary btn' onClick={handleSave}>
					{t('btn.save')}
				</button>
			</Dialog.Close>
		</div>
	</div>;
};

export const ShareModal = ({documentId}: {
	documentId: string;
}) => {
	const {document} = useDocument(documentId);

	return <Dialog.Root>
		<Dialog.Trigger asChild>
			<button className='btn-primary btn-sm btn-circle btn'>
				<ShareIcon fontSize={20}/>
			</button>
		</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Content className='modal modal-bottom data-[state=open]:modal-open sm:modal-middle' onOpenAutoFocus={e => e.preventDefault()}>
				<div className='modal-box'>
					{document
						? <ShareModalContent document={document}/>
						: <div className='flex items-center justify-center'><span className='loading loading-ring loading-lg'></span></div>
					}
				</div>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>;
};
