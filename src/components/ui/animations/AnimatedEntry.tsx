import { ReactNode, useEffect, useRef } from 'react';

import { Animated } from 'react-native';

interface AnimatedEntryProps {
	children: ReactNode;
	delay?: number;
	duration?: number;
}

export const AnimatedEntry = ({
	children,
	delay = 0,
	duration = 800,
}: AnimatedEntryProps) => {
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(new Animated.Value(-30)).current;

	useEffect(() => {
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration,
				delay,
				useNativeDriver: true,
			}),
			Animated.timing(slideAnim, {
				toValue: 0,
				duration,
				delay,
				useNativeDriver: true,
			}),
		]).start();
	}, [fadeAnim, slideAnim, delay, duration]);

	return (
		<Animated.View
			style={{
				width: '100%',
				opacity: fadeAnim,
				transform: [{ translateY: slideAnim }],
			}}
		>
			{children}
		</Animated.View>
	);
};
