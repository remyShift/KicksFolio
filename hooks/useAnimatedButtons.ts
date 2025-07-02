import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';

const useAnimatedButtons = (isDisabled: boolean) => {
	const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => {
		'worklet';
		return {
			transform: [{ scale: scale.value }],
		};
	}, [scale]);

	const handlePressIn = () => {
		if (isDisabled) return;

		scale.value = withSpring(0.9, {
			damping: 10,
			stiffness: 100,
		});

		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
	};

	const handlePressOut = () => {
		if (isDisabled) return;

		scale.value = withSpring(1, {
			damping: 10,
			stiffness: 100,
		});
	};

	return {
		animatedStyle,
		handlePressIn,
		handlePressOut,
		AnimatedPressable,
	};
};

export default useAnimatedButtons;
