import React from 'react';
import {useTranslation} from 'react-i18next';
import {useWhiteboard} from '~core/hooks';
import {shallow} from 'zustand/shallow';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {ChevronRightIcon, GithubIcon, MonitorIcon, MoonIcon, SunIcon} from 'ui/components/Icons';

export const DropdownSettings = ({children}: React.PropsWithChildren<{}>) => {
	const githubRepo = 'maxscharwath/describble';
	const {t, i18n} = useTranslation();
	const app = useWhiteboard();
	const theme = app.useStore(state => state.settings.theme, shallow);
	const changeTheme = (newTheme: string) => app.setTheme(newTheme as typeof theme);
	const changeLanguage = async (newLanguage: string) => i18n.changeLanguage(newLanguage);

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				{children}
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content
					className='rounded-box m-2 flex w-52 flex-col gap-2 border border-base-200 bg-base-100 p-4 shadow-lg'>
					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger className='btn-ghost btn-sm btn justify-between data-[highlighted]:btn-active'>
							{t('settings.theme')} <ChevronRightIcon/>
						</DropdownMenu.SubTrigger>
						<DropdownMenu.Portal>
							<DropdownMenu.SubContent className='rounded-box m-2 border border-base-200 bg-base-100 p-4 shadow-lg'>
								<DropdownMenu.RadioGroup value={theme} onValueChange={changeTheme} className='flex flex-col gap-2'>
									<DropdownMenu.RadioItem value='light'
										className='btn-sm btn justify-between data-[state=checked]:btn-primary data-[highlighted]:btn-active'>
										<SunIcon className='h-4 w-4'/> {t('settings.theme_light')}
									</DropdownMenu.RadioItem>
									<DropdownMenu.RadioItem value='dark'
										className='btn-sm btn justify-between data-[state=checked]:btn-primary data-[highlighted]:btn-active'>
										<MoonIcon className='h-4 w-4'/> {t('settings.theme_dark')}
									</DropdownMenu.RadioItem>
									<DropdownMenu.RadioItem value='system'
										className='btn-sm btn justify-between data-[state=checked]:btn-primary data-[highlighted]:btn-active'>
										<MonitorIcon className='h-4 w-4'/> {t('settings.theme_system')}
									</DropdownMenu.RadioItem>
								</DropdownMenu.RadioGroup>
							</DropdownMenu.SubContent>
						</DropdownMenu.Portal>
					</DropdownMenu.Sub>

					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger className='btn-ghost btn-sm btn justify-between data-[highlighted]:btn-active'>
							{t('settings.language')} <ChevronRightIcon/>
						</DropdownMenu.SubTrigger>
						<DropdownMenu.Portal>
							<DropdownMenu.SubContent className='rounded-box m-2 border border-base-200 bg-base-100 p-4 shadow-lg'>
								<DropdownMenu.RadioGroup value={i18n.language} onValueChange={changeLanguage}
									className='flex flex-col gap-2'>
									<DropdownMenu.RadioItem value='en'
										className='btn-sm btn justify-between data-[state=checked]:btn-primary data-[highlighted]:btn-active'>
										{t('lang.eng')}
									</DropdownMenu.RadioItem>
									<DropdownMenu.RadioItem value='fr'
										className='btn-sm btn justify-between data-[state=checked]:btn-primary data-[highlighted]:btn-active'>
										{t('lang.fr')}
									</DropdownMenu.RadioItem>
								</DropdownMenu.RadioGroup>
							</DropdownMenu.SubContent>
						</DropdownMenu.Portal>
					</DropdownMenu.Sub>
					<DropdownMenu.Item asChild>
						<a href={`https://github.com/${githubRepo}`} target='_blank' rel='noopener noreferrer'
							className='btn-ghost btn-sm btn justify-between'>
              Github
							<GithubIcon className='h-4 w-4'/>
						</a>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
};
