import Animated, {
	interpolate,
	interpolateColor,
	SharedValue,
	useAnimatedStyle,
} from 'react-native-reanimated';

export type Props = {
	index: number;
	scrollX: SharedValue<number>;
	carouselWidth: number;
};

export const AnimatedDot = ({ index, scrollX, carouselWidth }: Props) => {
	const dotAnimatedStyle = useAnimatedStyle(() => {
		const inputRange = [
			(index - 1) * carouselWidth,
			index * carouselWidth,
			(index + 1) * carouselWidth,
		];

		const width = interpolate(scrollX.value, inputRange, [8, 40, 8], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});

		const height = interpolate(scrollX.value, inputRange, [8, 8, 8], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});

		const borderRadius = interpolate(scrollX.value, inputRange, [4, 4, 4], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});

		const opacity = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});

		const backgroundColor = interpolateColor(scrollX.value, inputRange, [
			'#FF6B3580',
			'#FF6B35',
			'#FF6B3580',
		]);

		return {
			width,
			height,
			borderRadius,
			opacity,
			backgroundColor,
		};
	});

	return <Animated.View style={dotAnimatedStyle} />;
};
