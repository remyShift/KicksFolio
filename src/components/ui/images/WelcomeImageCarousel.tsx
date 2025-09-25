import { useEffect, useRef } from 'react';

import { Animated, Image, View } from 'react-native';

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

interface ScrollingImageRowProps {
	images: any[];
	direction: 'left' | 'right';
	speed?: number;
	imageSize?: number;
}

function ScrollingImageRow({
	images,
	direction,
	speed = 1,
	imageSize = 150,
}: ScrollingImageRowProps) {
	const scrollX = useRef(new Animated.Value(0)).current;

	const duplicatedImages = [...images, ...images, ...images];
	const imageWidth = imageSize + 12;
	const totalWidth = images.length * imageWidth;

	useEffect(() => {
		const startAnimation = () => {
			const startPosition = direction === 'left' ? 0 : -totalWidth;
			scrollX.setValue(startPosition);

			const endPosition = direction === 'left' ? -totalWidth : 0;

			Animated.loop(
				Animated.timing(scrollX, {
					toValue: endPosition,
					duration: totalWidth * speed,
					useNativeDriver: true,
				}),
				{ iterations: -1 }
			).start();
		};

		startAnimation();
	}, [scrollX, direction, speed, totalWidth]);

	return (
		<View className="overflow-hidden" style={{ height: imageSize }}>
			<Animated.View
				className="flex-row absolute"
				style={{
					transform: [{ translateX: scrollX }],
				}}
			>
				{duplicatedImages.map((imageSource, index) => (
					<View
						key={`image-${index}`}
						className="mr-3 rounded-xl overflow-hidden shadow-lg"
						style={{
							width: imageSize,
							height: imageSize,
						}}
					>
						<Image
							source={imageSource}
							style={{
								width: imageSize,
								height: imageSize,
							}}
							resizeMode="cover"
						/>
					</View>
				))}
			</Animated.View>
		</View>
	);
}

interface WelcomeImageCarouselProps {
	imagesPerRow?: number;
	speed?: number;
	imageSize?: number;
}

export default function WelcomeImageCarousel({
	imagesPerRow = 7,
	speed = 50,
	imageSize = 80,
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
