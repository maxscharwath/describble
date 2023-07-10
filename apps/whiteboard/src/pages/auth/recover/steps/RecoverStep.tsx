import React, {type ChangeEvent, useEffect, useMemo, useRef, useState} from 'react';
import {validateMnemonic} from 'ddnet';
import {MnemonicWord} from '~pages/auth/MnemoWord';
import {useTranslation} from 'react-i18next';
import {useSteps} from '~pages/auth/useSteps';
import {type AuthContext} from '~pages/auth/common';

export const RecoverStep: React.FC = () => {
	const {next, setState} = useSteps<AuthContext>();
	const [t] = useTranslation();
	const [phrase, setPhrase] = useState<string[]>(Array(12).fill(''));
	const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

	const handleChange = (e: ChangeEvent<HTMLInputElement>, i: number) => {
		const words = e.target.value.split(' ');
		if (words.length > 1) {
			words.forEach((word, wordIndex) => {
				if (i + wordIndex < 12) {
					setPhrase(prev => {
						const copy = [...prev];
						copy[i + wordIndex] = word;
						return copy;
					});
				}
			});
		} else {
			setPhrase(prev => {
				const copy = [...prev];
				copy[i] = e.target.value;
				return copy;
			});
		}

		if (e.target.value.includes(' ') && i < 11) {
			setTimeout(() => {
				inputRefs.current[i + 1]?.focus();
			}, 0);
		}
	};

	const isValid = useMemo(() => validateMnemonic(phrase.join(' ')), [phrase]);

	const handleNext = () => {
		if (isValid) {
			setState(prev => ({...prev, phrase: phrase.join(' ')}));
			next();
		}
	};

	useEffect(() => {
		inputRefs.current = inputRefs.current.slice(0, 12);
	}, []);

	return (
		<div className='grid gap-4'>
			<p className='text-center font-bold'>
				{t('login.subtitle_recovery_phrase')}
			</p>
			<div className='px-0 sm:px-8'>
				<div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
					{phrase.map((word, index) => (
						<MnemonicWord
							key={`${index}-${word}`}
							label={index + 1}
							value={word}
							onChange={e => handleChange(e, index)}
							ref={el => {
								inputRefs.current[index] = el;
							}}
						/>
					))}
				</div>
				<div className='form-control mt-6'>
					<button className='btn-neutral btn' disabled={!isValid} onClick={handleNext}>{t('btn.next')}</button>
				</div>
			</div>
		</div>
	);
};
