import { View } from 'react-native';

import { DEFAULT_CONFIG } from './config';
import ScrollingImageRow from './ScrollingImageRow';

const welcomeImages = [
	require('@/assets/images/welcome-screen/1.jpg'),
	require('@/assets/images/welcome-screen/2.jpg'),
	require('@/assets/images/welcome-screen/3.jpg'),
	require('@/assets/images/welcome-screen/4.jpg'),
	require('@/assets/images/welcome-screen/5.jpg'),
	require('@/assets/images/welcome-screen/6.jpg'),
	require('@/assets/images/welcome-screen/7.jpg'),
	require('@/assets/images/welcome-screen/8.jpg'),
	require('@/assets/images/welcome-screen/9.jpg'),
	require('@/assets/images/welcome-screen/10.jpg'),
	require('@/assets/images/welcome-screen/11.jpg'),
	require('@/assets/images/welcome-screen/12.jpg'),
	require('@/assets/images/welcome-screen/13.jpg'),
	require('@/assets/images/welcome-screen/14.jpg'),
	require('@/assets/images/welcome-screen/15.jpg'),
	require('@/assets/images/welcome-screen/16.jpg'),
	require('@/assets/images/welcome-screen/17.jpg'),
	require('@/assets/images/welcome-screen/18.jpg'),
	require('@/assets/images/welcome-screen/19.jpg'),
	require('@/assets/images/welcome-screen/20.jpg'),
	require('@/assets/images/welcome-screen/21.jpg'),
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
