import React, {type SVGProps} from 'react';

export const DescribbleLogo = ({textClassName, ...props}: SVGProps<SVGSVGElement> & {textClassName?: string}) => (
	<svg xmlns='http://www.w3.org/2000/svg'
		fill='currentColor'
		viewBox='0 0 980 160' {...props}>
		<path fillRule='evenodd'
			d='M12.3 6a49.2 49.2 0 0 1 26.4-6 46.6 46.6 0 0 0-18 17.8 42 42 0 0 0-3 17.8v64c0 2.6.5 5.6 3 7A41 41 0 0 0 36 108l-.4-74.7A33 33 0 0 1 50.7 7c6.2-4 17.7-7 29.5-7C131.9 0 160 35 160 79.5S129.4 159 82.4 159H28.5c-6.2-.2-14.4-.9-19.6-4.3a19.2 19.2 0 0 1-7.7-12.1C.4 138.8 0 131 0 131s6.1 5.4 9.2 7a41.2 41.2 0 0 0 19.2 4.5l54-.4c23.9 0 57.4-22.8 57.4-62.6s-27.7-62.7-59.7-62.7a33 33 0 0 0-21.3 6.5c-3.2 2.5-6 6.3-5.5 10.5 0 0 15.3.2 25.7 0 24-.5 41.7 16.7 42.5 45.7 1 28-18.6 45.4-42.5 45.4H28.5a31.5 31.5 0 0 1-22.2-8A23.4 23.4 0 0 1 0 100.2V35c0-4.8.2-9.6 1.6-14.3A25.5 25.5 0 0 1 12.3 6ZM79 107.5c8.4 0 24-5.8 24-28 0-22-15.6-28.9-24-28.9H53.4v57H79Z'
			clipRule='evenodd'/>
		<path
			className={textClassName}
			d='M229.4 159.8c-11 0-21-2.3-29.6-7a53.8 53.8 0 0 1-20.2-19.6 57 57 0 0 1-7.2-28.8 59 59 0 0 1 6.8-28.8c4.7-8.4 11-15 19.2-19.6a54 54 0 0 1 28-7.2c10.4 0 19.3 2.3 26.8 7a43.6 43.6 0 0 1 17 19c4 8 6 17.3 6 27.8 0 2.5-.9 4.7-2.6 6.4a9.4 9.4 0 0 1-6.6 2.4h-80.6v-16h80l-8.2 5.6a42.1 42.1 0 0 0-4-17.8 30.2 30.2 0 0 0-10.8-12.6c-4.7-3-10.3-4.6-17-4.6a37 37 0 0 0-19.6 5c-5.3 3.3-9.4 8-12.2 13.8a44.1 44.1 0 0 0 .8 39.2c3.3 5.7 8 10.3 13.8 13.6a40.2 40.2 0 0 0 32.8 2.8c4.4-1.6 8-3.4 10.6-5.4 2-1.5 4.1-2.2 6.4-2.2 2.4-.1 4.5.5 6.2 2 2.3 2 3.5 4.2 3.6 6.6.1 2.4-1 4.5-3.2 6.2a55.1 55.1 0 0 1-17 8.8c-6.7 2.3-13 3.4-19.2 3.4Zm94.6 0c-9.3 0-18-1.4-26-4.2-7.8-3-14-6.6-18.4-11a8.9 8.9 0 0 1-2.6-7.2 10 10 0 0 1 4-6.8c2.7-2.1 5.3-3 7.8-2.6 2.7.3 5 1.4 6.8 3.4 2.3 2.5 5.9 5 10.8 7.2 5 2.1 10.7 3.2 16.8 3.2 7.8 0 13.6-1.3 17.6-3.8 4.2-2.5 6.3-5.8 6.4-9.8.2-4-1.8-7.5-5.8-10.4-3.8-3-11-5.3-21.4-7.2a64 64 0 0 1-29.4-12c-6-5.3-9-11.9-9-19.6a24 24 0 0 1 6-16.8c4-4.5 9.2-7.9 15.4-10a61 61 0 0 1 43 .8 40 40 0 0 1 16.2 11.6 9.4 9.4 0 0 1 2.6 6.8 7.7 7.7 0 0 1-3.4 5.8 9.8 9.8 0 0 1-7.6 1.4c-3-.5-5.4-1.7-7.4-3.6-3.3-3.2-7-5.4-10.8-6.6a45.3 45.3 0 0 0-28.4 1.2c-4 2-6 5-6 8.8 0 2.4.6 4.6 1.8 6.6 1.4 1.9 3.9 3.6 7.6 5.2 3.8 1.5 9.2 3 16.4 4.4 10 2 17.9 4.5 23.6 7.6 5.9 3 10 6.7 12.6 10.8a29 29 0 0 1-1.2 30.6 33 33 0 0 1-14.4 11.8c-6.2 3-14.1 4.4-23.6 4.4Zm100.4 0a56.6 56.6 0 0 1-28.6-7.2 54.7 54.7 0 0 1-19.6-19.8c-4.7-8.4-7-17.9-7-28.4 0-10.8 2.3-20.4 7-28.8 4.7-8.4 11-15 19.2-19.6a54 54 0 0 1 28-7.2 50.2 50.2 0 0 1 39.2 18c1.9 2.1 2.5 4.3 2 6.6s-2 4.3-4.4 6a8 8 0 0 1-6.2 1.4c-2.3-.5-4.3-1.7-6.2-3.6a32.2 32.2 0 0 0-24.4-10.4 33.6 33.6 0 0 0-30.2 17.8c-3 5.6-4.4 12.2-4.4 19.8a35.8 35.8 0 0 0 17 32.6 41.6 41.6 0 0 0 30.8 3.2c3.6-1.2 6.9-3 9.8-5.4 2.1-1.7 4.3-2.7 6.6-2.8 2.3-.3 4.3.3 6 1.8 2.3 1.9 3.5 4 3.8 6.4.3 2.3-.5 4.3-2.4 6.2a50.8 50.8 0 0 1-36 13.4Zm62.3-69.2c0-8 2-15.1 5.8-21.4a43.8 43.8 0 0 1 38-20.8c8 0 14 1.3 17.8 4 4 2.5 5.6 5.6 4.6 9.2a7.9 7.9 0 0 1-2.4 4.4c-1 1-2.3 1.5-3.8 1.8-1.4.3-3 .2-4.8-.2a56 56 0 0 0-23-.4 31.7 31.7 0 0 0-16.2 8.2 21 21 0 0 0-5.8 15.2h-10.2Zm.2 68.4c-3.2 0-5.6-.8-7.4-2.4-1.7-1.7-2.6-4.3-2.6-7.6V59.6c0-3.2.9-5.7 2.6-7.4 1.8-1.7 4.2-2.6 7.4-2.6 3.4 0 5.8.9 7.4 2.6 1.8 1.6 2.6 4 2.6 7.4V149c0 3.2-.8 5.7-2.6 7.4-1.6 1.7-4 2.6-7.4 2.6Zm81.5 0c-3 0-5.4-1-7.4-2.8-1.9-2-2.8-4.5-2.8-7.4v-89c0-3 1-5.5 2.8-7.4 2-1.9 4.5-2.8 7.4-2.8 3 0 5.5 1 7.4 2.8a10 10 0 0 1 2.8 7.4v89c0 3-1 5.4-2.8 7.4a10 10 0 0 1-7.4 2.8Zm0-127.2c-3.6 0-6.7-1.3-9.4-3.8a13.2 13.2 0 0 1-3.8-9.4c0-3.6 1.3-6.7 3.8-9.2a12.9 12.9 0 0 1 18.6 0 12.9 12.9 0 0 1 0 18.6 12.5 12.5 0 0 1-9.2 3.8Zm85.1 128a54.7 54.7 0 0 1-28-7.2 54.2 54.2 0 0 1-19.6-20 57.7 57.7 0 0 1-7.4-28.4V13c0-3 1-5.5 2.8-7.4 2-1.9 4.5-2.8 7.4-2.8 3.1 0 5.6 1 7.4 2.8A10 10 0 0 1 619 13v54a50.6 50.6 0 0 1 38.6-18.2A50.2 50.2 0 0 1 702 76a57.7 57.7 0 0 1 6.8 28.2 55 55 0 0 1-27 48.4 55.1 55.1 0 0 1-28.2 7.2Zm0-18c6.8 0 13-1.6 18.2-4.8a38.7 38.7 0 0 0 17.4-32.8 38 38 0 0 0-4.8-19.2 34.3 34.3 0 0 0-30.8-18.2A34.3 34.3 0 0 0 622.7 85c-3 5.6-4.6 12-4.6 19.2a40 40 0 0 0 4.6 19.2c3.1 5.7 7.3 10.3 12.6 13.6a35.4 35.4 0 0 0 18.2 4.8Zm122.7 18a54.7 54.7 0 0 1-28-7.2 54.2 54.2 0 0 1-19.6-20 57.7 57.7 0 0 1-7.4-28.4V13c0-3 .9-5.5 2.8-7.4 2-1.9 4.4-2.8 7.4-2.8s5.5 1 7.4 2.8a10 10 0 0 1 2.8 7.4v54a50.6 50.6 0 0 1 38.6-18.2A50.2 50.2 0 0 1 824.6 76a57.7 57.7 0 0 1 6.8 28.2 55 55 0 0 1-27 48.4 55.1 55.1 0 0 1-28.2 7.2Zm0-18c6.8 0 12.8-1.6 18.2-4.8a38.7 38.7 0 0 0 17.4-32.8A38 38 0 0 0 807 85a34.3 34.3 0 0 0-30.8-18.2A34.3 34.3 0 0 0 745.4 85c-3.1 5.6-4.6 12-4.6 19.2a40 40 0 0 0 4.6 19.2c3 5.7 7.2 10.3 12.6 13.6a35.4 35.4 0 0 0 18.2 4.8Zm93.6 17.2c-5.9 0-11-1.6-15.6-4.8a32 32 0 0 1-10.6-13c-2.5-5.6-3.8-12-3.8-19.2V12.8c0-3 1-5.3 2.8-7.2 1.9-1.9 4.3-2.8 7.2-2.8s5.3 1 7.2 2.8a9.7 9.7 0 0 1 2.8 7.2V122c0 5 1 9 2.8 12.2 1.9 3.2 4.3 4.8 7.2 4.8h5a8 8 0 0 1 6.4 2.8c1.7 1.9 2.6 4.3 2.6 7.2s-1.3 5.3-3.8 7.2-5.8 2.8-9.8 2.8h-.4Zm61.3.8c-11 0-21-2.3-29.6-7a53.8 53.8 0 0 1-20.2-19.6 57 57 0 0 1-7.2-28.8 59 59 0 0 1 6.8-28.8c4.7-8.4 11-15 19.2-19.6a54 54 0 0 1 28-7.2c10.4 0 19.3 2.3 26.8 7a43.6 43.6 0 0 1 17 19c4 8 6 17.3 6 27.8 0 2.5-.9 4.7-2.6 6.4a9.4 9.4 0 0 1-6.6 2.4h-80.6v-16h80l-8.2 5.6a42.1 42.1 0 0 0-4-17.8 30.2 30.2 0 0 0-10.8-12.6c-4.7-3-10.3-4.6-17-4.6a37 37 0 0 0-19.6 5c-5.3 3.3-9.4 8-12.2 13.8a44.1 44.1 0 0 0 .8 39.2c3.3 5.7 8 10.3 13.8 13.6a40.2 40.2 0 0 0 32.8 2.8c4.4-1.6 8-3.4 10.6-5.4 2-1.5 4.1-2.2 6.4-2.2 2.4-.1 4.5.5 6.2 2 2.3 2 3.5 4.2 3.6 6.6.1 2.4-1 4.5-3.2 6.2a55.1 55.1 0 0 1-17 8.8c-6.7 2.3-13 3.4-19.2 3.4Z'/>
	</svg>
);
