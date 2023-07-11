import {useDocument} from '~core/hooks/useDocument';
import {useSession} from '~core/hooks/useSession';
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {KeyIcon, ShareIcon, TrashIcon} from 'ui/components/Icons';
import {KeyAvatar} from '~components/ui/KeyAvatar';
import {type Document} from 'ddnet';
import {type SyncedDocument} from '~core/managers';
import {useTranslation} from 'react-i18next';

const ShareModalContent = ({document}: {
	document: Document<SyncedDocument>;
}) => {
	const {t} = useTranslation();
	const session = useSession();
	const [publicKey, setPublicKey] = React.useState('');
	const [allowedClients, setAllowedClients] = React.useState<Array<{base58: string}>>(document.header.allowedClients);

	const isOwner = document.header.owner.base58 === session?.base58PublicKey;

	const handleAddPublicKey = () => {
		if (!publicKey || allowedClients.some(client => client.base58 === publicKey)) {
			return;
		}

		setPublicKey('');
		setAllowedClients([...allowedClients, {base58: publicKey}]);
		console.log('added allowed client to state', publicKey);
	};

	const handleRemovePublicKey = (publicKey: string) => {
		setAllowedClients(prev => prev.filter(client => client.base58 !== publicKey));
	};

	const handleCopyPublicKey = (publicKey: string) => {
		void navigator.clipboard.writeText(publicKey);
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
					<button className='btn-square join-item btn' onClick={handleAddPublicKey}>
						<KeyIcon fontSize={20}/>
					</button>
				</div>
			</div>
		)}

		<ul className='menu rounded-box bg-base-200'>
			<li>
				<h2 className='menu-title'>{t('share.owner')}</h2>
				<ul>
					<li onClick={() => handleCopyPublicKey(document.header.owner.base58)}>
						<div>
							<KeyAvatar value={document.header.owner.base58} className='w-8'/>
							<span className='w-full truncate font-mono text-sm'>{document.header.owner.base58}</span>
						</div>
					</li>
				</ul>
			</li>
			{(allowedClients.length > 0) && (<li>
				<h2 className='menu-title'>{t('share.allowed_clients')}</h2>
				<ul>
					{allowedClients.map(({base58}) => (
						<li key={base58} onClick={() => handleCopyPublicKey(base58)}>
							<div>
								<KeyAvatar value={base58} className='w-8'/>
								<span className='w-full truncate font-mono text-sm'>{base58}</span>
								{isOwner && (
									<button className='btn-ghost btn-circle btn' onClick={() => handleRemovePublicKey(base58)}>
										<TrashIcon fontSize={20}/>
									</button>
								)}
							</div>
						</li>
					))}
				</ul>
			</li>)}
		</ul>

		<div className='flex justify-end gap-2'>
			<Dialog.Close asChild>
				<button className='btn-ghost btn'>{t('btn.cancel')}</button>
			</Dialog.Close>

			<Dialog.Close asChild>
				<button className='btn-primary btn'>{t('btn.save')}</button>
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
