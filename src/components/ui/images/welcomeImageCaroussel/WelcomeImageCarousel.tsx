import { View } from 'react-native';

import ScrollingImageRow from './ScrollingImageRow';
import { welcomeImagesRows } from './welcomeImages';

export interface WelcomeImageCarouselProps {
	speed?: number;
	imageSize?: number;
}

export default function WelcomeImageCarousel({
	speed = 50,
	imageSize = 80,
}: WelcomeImageCarouselProps) {
	return (
		<View className="w-full">
			<ScrollingImageRow
				images={welcomeImagesRows[0]}
				direction="left"
				speed={speed}
				imageSize={imageSize}
			/>

			<View className="h-6" />

			<ScrollingImageRow
				images={welcomeImagesRows[1]}
				direction="right"
				speed={speed}
				imageSize={imageSize}
			/>

			<View className="h-6" />

			<ScrollingImageRow
				images={welcomeImagesRows[2]}
				direction="left"
				speed={speed}
				imageSize={imageSize}
			/>
		</View>
	);
}
