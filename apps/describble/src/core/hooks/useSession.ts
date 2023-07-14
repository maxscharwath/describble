import {useEffect, useState} from 'react';
import {useWhiteboard} from '~core/hooks/useWhiteboard';
import {type KeySession} from '@describble/ddnet';

export const useSession = () => {
	const app = useWhiteboard();
	const [session, setSession] = useState<KeySession | null>(app.sessionManager.currentSession);
	useEffect(() => app.sessionManager.onChange(setSession), [app]);
	return session;
};
