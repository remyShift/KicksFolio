import { useEffect, useRef } from 'react';

import { Animated, Easing } from 'react-native';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface AnimatedShoeIconProps {
	name: keyof typeof MaterialCommunityIcons.glyphMap;
	size: number;
	color: string;
}

export const AnimatedShoeIcon = ({
	name,
	size,
	color,
}: AnimatedShoeIconProps) => {
	const rotateValue = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const rotation = Animated.loop(
			Animated.timing(rotateValue, {
				toValue: 1,
				duration: 2000,
				easing: Easing.linear,
				useNativeDriver: true,
			})
		);

		rotation.start();

		return () => {
			rotation.stop();
		};
	}, [rotateValue]);

	const rotate = rotateValue.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '360deg'],
	});

	return (
		<Animated.View style={{ transform: [{ rotate }, { scaleX: -1 }] }}>
			<MaterialCommunityIcons name={name} size={size} color={color} />
		</Animated.View>
	);
};
