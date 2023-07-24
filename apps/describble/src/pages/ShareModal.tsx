import {useSession} from '~core/hooks/useSession';
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {HashIcon, KeyIcon, ShareIcon, TrashIcon} from 'ui/components/Icons';
import {KeyAvatar} from '~components/ui/KeyAvatar';
import {base58, type Document, validatePublicKey} from '@describble/ddnet';
import {type DocumentMetadata, type SyncedDocument} from '~core/managers';
import {useTranslation} from 'react-i18next';

const ShareModalContent = ({document}: {
	document: Document<SyncedDocument, DocumentMetadata>;
}) => {
	const {t} = useTranslation();
	const session = useSession();
	const [publicKey, setPublicKey] = React.useState('');
	const [allowedClientKeys, setAllowedClientKeys] = React.useState<string[]>(document.header.allowedClients.map(client => client.base58));
	const [name, setName] = React.useState(document.header.metadata.name ?? '');
	const [metadata] = React.useState(Object.entries(document.header.metadata));

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
		if (!publicKey || allowedClientKeys.some(client => client === publicKey)) {
			return;
		}

		setPublicKey('');
		setAllowedClientKeys([...allowedClientKeys, publicKey]);
	};

	const handleRemovePublicKey = (publicKey: string) => {
		setAllowedClientKeys(prev => prev.filter(client => client !== publicKey));
	};

	const handleCopy = (text: string) => {
		void navigator.clipboard.writeText(text);
	};

	const handleSave = () => {
		const header = document.header.update(
			{
				allowedClientKeys,
				metadata: {...document.header.metadata, name},
			},
			session.privateKey,
		);
		document.updateHeader(header);
	};

	return 	<div className='grid gap-4'>
		<Dialog.Title className='card-title'>
			{t('share.share_settings')}
		</Dialog.Title>

		{isOwner && (
			<>
				<div className='form-control'>
					<div className='join'>
						<div className='join-item flex h-full items-center justify-center bg-base-300 p-2'>
							<KeyAvatar value={publicKey} className='w-8'/>
						</div>
						<input type='text' className='input join-item input-bordered w-full font-mono text-sm'
							placeholder={t('input.add_public_key')} value={publicKey} onChange={e => setPublicKey(e.target.value)}/>
						<button className='btn btn-square join-item' onClick={handleAddPublicKey} disabled={!isValidPublicKey}>
							<KeyIcon fontSize={20}/>
						</button>
					</div>
				</div>
				<div className='form-control'>
					<div className='join'>
						<input type='text' className='input input-bordered w-full font-mono text-sm'
							value={name}
							placeholder={t('input.document_name')}
							onChange={e => setName(e.target.value)} />
					</div>
				</div>
			</>
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
						{(metadata.length > 0) && (<li>
							<details>
								<summary className='font-bold text-base-content/40'>{t('share.metadata')}</summary>
								<ul>
									{metadata.map(([key, value]) => (
										<li key={key}>
											<div className='flex items-center justify-between'>
												<span className='w-1/3 truncate font-bold text-base-content/40'>{key}</span>
												<span className='w-full truncate font-mono text-xs'>{String(value)}</span>
											</div>
										</li>
									))}
								</ul>
							</details>
						</li>)}
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
			{(allowedClientKeys.length > 0) && (<li>
				<details open>
					<summary className='font-bold text-base-content/40'>{t('share.allowed_clients')}</summary>
					<ul>
						{allowedClientKeys.map(publicKey => (
							<li key={publicKey} onClick={() => handleCopy(publicKey)}>
								<div>
									<KeyAvatar value={publicKey} className='w-8'/>
									<span className='w-full truncate font-mono text-xs'>{publicKey}</span>
									{isOwner && (
										<button className='btn btn-circle btn-ghost' onClick={() => handleRemovePublicKey(publicKey)}>
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
				<button className='btn btn-ghost'>{t('btn.cancel')}</button>
			</Dialog.Close>

			<Dialog.Close asChild>
				<button className='btn btn-primary' onClick={handleSave}>
					{t('btn.save')}
				</button>
			</Dialog.Close>
		</div>
	</div>;
};

export const ShareModal = ({document}: {
	document: Document<SyncedDocument, DocumentMetadata> | null;
}) => <Dialog.Root>
	<Dialog.Trigger asChild>
		<button className='btn btn-circle btn-primary btn-sm'>
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
