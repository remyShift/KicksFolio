import { useEffect, useRef } from 'react';

import { Animated, Image, View } from 'react-native';

import { DEFAULT_CONFIG } from './WelcomeImageCarousel';

export interface ScrollingImageRowProps {
	images: any[];
	direction: 'left' | 'right';
	speed?: number;
	imageSize?: number;
}

export default function ScrollingImageRow({
	images,
	direction,
	speed = 1,
	imageSize = 150,
}: ScrollingImageRowProps) {
	const scrollX = useRef(new Animated.Value(0)).current;

	const duplicatedImages = [...images, ...images, ...images];
	const imageWidth = imageSize + DEFAULT_CONFIG.IMAGE_MARGIN;
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
