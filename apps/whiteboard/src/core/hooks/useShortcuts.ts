import {useHotkeys} from 'react-hotkeys-hook';
import {useWhiteboard} from '~core/hooks/useWhiteboard';
export const useShortcuts = () => {
	const app = useWhiteboard();
	useHotkeys('v,1', () => {
		app.setTool('select');
	}, undefined, [app]);
	useHotkeys('m,2', () => {
		app.setTool('move');
	}, undefined, [app]);
	useHotkeys('p,3', () => {
		app.setTool('path');
	}, undefined, [app]);
	useHotkeys('r,4', () => {
		app.setTool('rectangle');
	}, undefined, [app]);
	useHotkeys('c,5', () => {
		app.setTool('circle');
	}, undefined, [app]);
	useHotkeys('l,6', () => {
		app.setTool('line');
	}, undefined, [app]);
	useHotkeys('a,7', () => {
		app.setTool('arrow');
	}, undefined, [app]);
	useHotkeys('i,8', () => {
		app.setTool('image');
	}, undefined, [app]);
	useHotkeys('t,9', () => {
		app.setTool('text');
	}, undefined, [app]);
	useHotkeys('e,0', () => {
		app.setTool('embed');
	}, undefined, [app]);

	useHotkeys('backspace,del', () => {
		app.removeLayer(...app.selectedLayers);
	}, undefined, [app]);

	useHotkeys('meta+a,ctrl+a', e => {
		e.preventDefault();
		app.selectAll();
		app.setTool('select');
	}, undefined, [app]);

	useHotkeys('meta+shift+a,ctrl+shift+a', e => {
		e.preventDefault();
		app.selectNone();
	}, undefined, [app]);

	useHotkeys('meta+z,ctrl+z', e => {
		e.preventDefault();
		if (app.activity.activity) {
			app.activity.abortActivity();
		} else {
			app.undo();
		}
	}, undefined, [app]);

	useHotkeys('meta+shift+z,ctrl+shift+z', e => {
		e.preventDefault();
		if (app.activity.activity) {
			app.activity.abortActivity();
		} else {
			app.redo();
		}
	}, undefined, [app]);

	// Toggle dark mode
	useHotkeys('meta+shift+d,ctrl+shift+d', e => {
		e.preventDefault();
		app.toggleDarkMode();
	}, undefined, [app]);
};
