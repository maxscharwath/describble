import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import {useSteps} from '~pages/login/useSteps';
import {ClosedEyeIcon, CopyIcon, OpenEyeIcon} from 'ui/components/Icons';
import {generateMnemonic} from 'ddnet';
import {type RegisterContext} from '~pages/login/RegisterContent';
import {MnemonicWord} from '~pages/login/MnemoWord';

export const RecoveryPhraseStep: React.FC = () => {
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
			<p className='text-md text-center font-bold'>
				Please write down the following phrase and keep it safe. You will need it to recover your account.
			</p>
			<div className='px-0 sm:px-8'>
				<div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
					{phrase.split(' ').map((word, index) => (
						<MnemonicWord key={`${word}-${index}`} label={index + 1} value={word} hidden={!isPhraseVisible} readOnly />
					))}
				</div>
				<div className='mt-2 flex justify-between gap-2'>
					<button className='btn-ghost btn-sm btn' onClick={toggleVisibility}>
						<div className={clsx('swap swap-rotate', isPhraseVisible && 'swap-active')}>
							<OpenEyeIcon className='swap-off' />
							<ClosedEyeIcon className='swap-on' />
						</div>
						{isPhraseVisible ? 'Hide Phrase' : 'Show Phrase'}
					</button>
					<button className='btn-ghost btn-sm btn' onClick={copyPhrase}>
						<CopyIcon /> Copy to Clipboard
					</button>
				</div>
				<div className='mt-6 flex gap-4'>
					<button className='btn-neutral btn grow' onClick={prev}>Back</button>
					<button className='btn-neutral btn grow' onClick={next}>Next</button>
				</div>
			</div>
		</>
	);
};
