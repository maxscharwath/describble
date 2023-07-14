import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import {useSteps} from '~pages/auth/useSteps';
import {ClosedEyeIcon, CopyIcon, OpenEyeIcon} from 'ui/components/Icons';
import {generateMnemonic} from '@ddnet/core';
import {type RegisterContext} from '~pages/auth/register/Register';
import {MnemonicWord} from '~components/ui/MnemoWord';
import {useTranslation} from 'react-i18next';

export const RecoveryPhraseStep: React.FC = () => {
	const {t} = useTranslation();
	const {prev, next, state: {phrase}, setState} = useSteps<RegisterContext>();
	const [isPhraseVisible, setIsPhraseVisible] = useState(false);

	// Generate a new phrase if one doesn't exist
	useEffect(() => {
		setState(prevState => ({...prevState, phrase: prevState.phrase ?? generateMnemonic()}));
	}, []);

	if (!phrase) {
		return null;
	}

	const toggleVisibility = () => setIsPhraseVisible(!isPhraseVisible);
	const copyPhrase = async () => navigator.clipboard.writeText(phrase);

	return (
		<>
			<p className='text-center font-bold'>
				{t('register.subtitle_please_write_down_phrase')}
			</p>
			<div className='px-0 sm:px-8'>
				<div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
					{phrase.split(' ').map((word, index) => (
						<MnemonicWord key={`${word}-${index}`} label={index + 1} value={word} hidden={!isPhraseVisible} readOnly />
					))}
				</div>
				<div className='mt-2 flex flex-wrap justify-between gap-2'>
					<button className='btn-ghost btn-sm btn' onClick={toggleVisibility}>
						<div className={clsx('swap swap-rotate', isPhraseVisible && 'swap-active')}>
							<OpenEyeIcon className='swap-off' />
							<ClosedEyeIcon className='swap-on' />
						</div>
						<span className='truncate'>{isPhraseVisible ? t('btn.hide_phrase') : t('btn.show_phrase')}</span>
					</button>
					<button className='btn-ghost btn-sm btn' onClick={copyPhrase}>
						<CopyIcon /> <span className='truncate'>{t('btn.copy_to_clipboard')}</span>
					</button>
				</div>
				<div className='mt-6 flex gap-4'>
					<button className='btn-neutral btn grow' onClick={prev}>{t('btn.back')}</button>
					<button className='btn-neutral btn grow' onClick={next}>{t('btn.next')}</button>
				</div>
			</div>
		</>
	);
};
