import { Gesture } from 'react-native-gesture-handler';
import {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';

import * as Haptics from 'expo-haptics';

const triggerHaptic = () => {
	Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

const useAnimatedButtons = (isDisabled: boolean) => {
	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ scale: scale.value }],
		};
	});

	const gesture = Gesture.Tap()
		.onBegin(() => {
			if (isDisabled) return;

			scale.value = withSpring(0.9, {
				damping: 10,
				stiffness: 100,
			});

			runOnJS(triggerHaptic)();
		})
		.onFinalize(() => {
			if (isDisabled) return;

			scale.value = withSpring(1, {
				damping: 10,
				stiffness: 100,
			});
		});

	return {
		animatedStyle,
		gesture,
	};
};

export default useAnimatedButtons;
