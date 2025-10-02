import { View } from 'react-native';

import { DEFAULT_CONFIG } from './config';
import ScrollingImageRow from './ScrollingImageRow';

const welcomeImages = [
	require('@/assets/images/welcome-screen/1.png'),
	require('@/assets/images/welcome-screen/2.png'),
	require('@/assets/images/welcome-screen/3.png'),
	require('@/assets/images/welcome-screen/4.png'),
	require('@/assets/images/welcome-screen/5.png'),
	require('@/assets/images/welcome-screen/6.png'),
	require('@/assets/images/welcome-screen/7.png'),
	require('@/assets/images/welcome-screen/8.png'),
	require('@/assets/images/welcome-screen/9.png'),
	require('@/assets/images/welcome-screen/10.png'),
	require('@/assets/images/welcome-screen/11.png'),
	require('@/assets/images/welcome-screen/12.png'),
	require('@/assets/images/welcome-screen/13.png'),
	require('@/assets/images/welcome-screen/14.png'),
	require('@/assets/images/welcome-screen/15.png'),
	require('@/assets/images/welcome-screen/16.png'),
	require('@/assets/images/welcome-screen/17.png'),
	require('@/assets/images/welcome-screen/18.png'),
	require('@/assets/images/welcome-screen/19.png'),
	require('@/assets/images/welcome-screen/20.png'),
	require('@/assets/images/welcome-screen/21.png'),
];

export interface WelcomeImageCarouselProps {
	imagesPerRow?: number;
	speed?: number;
	imageSize?: number;
}

export default function WelcomeImageCarousel({
	imagesPerRow = DEFAULT_CONFIG.IMAGES_PER_ROW,
	speed = DEFAULT_CONFIG.SPEED,
	imageSize = DEFAULT_CONFIG.IMAGE_SIZE,
}: WelcomeImageCarouselProps) {
	const imageRows = (() => {
		const rows: any[][] = [[], [], []];

		welcomeImages.forEach((imageSource, index) => {
			const rowIndex = index % 3;
			rows[rowIndex].push(imageSource);
		});

		return rows.map((row) => {
			const finalRow = [...row];
			while (finalRow.length < imagesPerRow) {
				finalRow.push(...row);
			}
			return finalRow.slice(0, imagesPerRow);
		});
	})();

	return (
		<View className="flex justify-center gap-6">
			<ScrollingImageRow
				images={imageRows[0]}
				direction="left"
				speed={speed}
				imageSize={imageSize}
			/>

			<ScrollingImageRow
				images={imageRows[1]}
				direction="right"
				speed={speed * 1.1}
				imageSize={imageSize}
			/>

			<ScrollingImageRow
				images={imageRows[2]}
				direction="left"
				speed={speed * 0.9}
				imageSize={imageSize}
			/>
		</View>
	);
}
