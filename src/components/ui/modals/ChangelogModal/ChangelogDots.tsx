import React from 'react';

import { View } from 'react-native';
import Animated, {
	interpolate,
	interpolateColor,
	SharedValue,
	useAnimatedStyle,
} from 'react-native-reanimated';

interface DotProps {
	index: number;
	scrollX: SharedValue<number>;
	modalWidth: number;
}

function Dot({ index, scrollX, modalWidth }: DotProps) {
	const animatedStyle = useAnimatedStyle(() => {
		const inputRange = [
			(index - 1) * modalWidth,
			index * modalWidth,
			(index + 1) * modalWidth,
		];

		const width = interpolate(scrollX.value, inputRange, [8, 32, 8], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});

		const backgroundColor = interpolateColor(scrollX.value, inputRange, [
			'#d1d5db',
			'#F27329',
			'#d1d5db',
		]);

		return {
			width,
			backgroundColor,
		};
	});

	return (
		<Animated.View
			style={animatedStyle}
			className="h-2 rounded-full mx-1"
		/>
	);
}

interface ChangelogDotsProps {
	slidesCount: number;
	scrollX: SharedValue<number>;
	modalWidth: number;
}

export function ChangelogDots({
	slidesCount,
	scrollX,
	modalWidth,
}: ChangelogDotsProps) {
	return (
		<View className="flex-row justify-center items-center mb-6">
			{Array.from({ length: slidesCount }).map((_, index) => (
				<Dot
					key={index}
					index={index}
					scrollX={scrollX}
					modalWidth={modalWidth}
				/>
			))}
		</View>
	);
}
