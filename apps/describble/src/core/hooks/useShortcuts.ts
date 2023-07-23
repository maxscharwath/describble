import {useHotkeys} from 'react-hotkeys-hook';
import {useWhiteboard} from '~core/hooks/useWhiteboard';
export const useShortcuts = () => {
	const app = useWhiteboard();
	useHotkeys('v,1', () => {
		app.setTool('select');
	}, {scopes: 'whiteboard'}, [app]);
	useHotkeys('m,2', () => {
		app.setTool('move');
	}, {scopes: 'whiteboard'}, [app]);
	useHotkeys('p,3', () => {
		app.setTool('path');
	}, {scopes: 'whiteboard'}, [app]);
	useHotkeys('r,4', () => {
		app.setTool('rectangle');
	}, {scopes: 'whiteboard'}, [app]);
	useHotkeys('c,5', () => {
		app.setTool('circle');
	}, {scopes: 'whiteboard'}, [app]);
	useHotkeys('l,6', () => {
		app.setTool('line');
	}, {scopes: 'whiteboard'}, [app]);
	useHotkeys('a,7', () => {
		app.setTool('arrow');
	}, {scopes: 'whiteboard'}, [app]);
	useHotkeys('i,8', () => {
		app.setTool('image');
	}, {scopes: 'whiteboard'}, [app]);
	useHotkeys('t,9', () => {
		app.setTool('text');
	}, {scopes: 'whiteboard'}, [app]);
	useHotkeys('e,0', () => {
		app.setTool('embed');
	}, {scopes: 'whiteboard'}, [app]);

	useHotkeys('backspace,del', () => {
		app.document.layers.delete(app.selectedLayers);
	}, {scopes: 'whiteboard'}, [app]);

	useHotkeys('meta+a,ctrl+a', e => {
		e.preventDefault();
		app.selectAll();
		app.setTool('select');
	}, {scopes: 'whiteboard'}, [app]);

	useHotkeys('meta+shift+a,ctrl+shift+a', e => {
		e.preventDefault();
		app.selectNone();
	}, {scopes: 'whiteboard'}, [app]);

	useHotkeys('meta+z,ctrl+z', e => {
		e.preventDefault();
		if (app.activity.activity) {
			app.activity.abortActivity();
		} else {
			app.undo();
		}
	}, {scopes: 'whiteboard'}, [app]);

	useHotkeys('meta+shift+z,ctrl+shift+z', e => {
		e.preventDefault();
		if (app.activity.activity) {
			app.activity.abortActivity();
		} else {
			app.redo();
		}
	}, {scopes: 'whiteboard'}, [app]);

	// Toggle dark mode
	useHotkeys('meta+shift+d,ctrl+shift+d', e => {
		e.preventDefault();
		const {theme} = app.state.settings;
		app.setTheme(theme === 'dark' ? 'light' : 'dark');
	}, undefined, [app]);
};
