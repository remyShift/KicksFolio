import { useEffect, useMemo } from 'react';

import { Image, ImageSourcePropType, View } from 'react-native';
import Animated, {
	cancelAnimation,
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from 'react-native-reanimated';

export interface ScrollingImageRowProps {
	images: ImageSourcePropType[];
	direction: 'left' | 'right';
	speed?: number;
	imageSize?: number;
}

export default function ScrollingImageRow({
	images,
	direction,
	speed = 50,
	imageSize = 80,
}: ScrollingImageRowProps) {
	const scrollValue = useSharedValue(0);

	const actualImageWidth = imageSize + 50;
	const singleSetWidth = images.length * actualImageWidth;

	const duplicatedImages = useMemo(() => {
		return [...images, ...images];
	}, [images]);

	useEffect(() => {
		const duration = (singleSetWidth / speed) * 1000;

		scrollValue.value = withRepeat(
			withTiming(singleSetWidth * 10000, {
				duration: duration * 10000,
				easing: Easing.linear,
			}),
			-1,
			false
		);

		return () => {
			cancelAnimation(scrollValue);
		};
	}, [speed, singleSetWidth, scrollValue]);

	const animatedStyle = useAnimatedStyle(() => {
		'worklet';

		const wrappedValue = scrollValue.value % singleSetWidth;

		const translateValue =
			direction === 'left'
				? -wrappedValue
				: wrappedValue - singleSetWidth;

		return {
			transform: [{ translateX: translateValue }],
		};
	});

	return (
		<View className="overflow-hidden" style={{ height: imageSize }}>
			<Animated.View className="flex-row absolute" style={animatedStyle}>
				{duplicatedImages.map((imageSource, index) => (
					<View
						key={`image-${index}`}
						className="mr-3 rounded-xl overflow-hidden"
						style={{
							width: actualImageWidth,
							height: imageSize,
						}}
					>
						<Image
							source={imageSource}
							style={{
								width: actualImageWidth,
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
