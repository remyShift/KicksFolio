import { useCallback, useEffect, useRef, useState } from 'react';

import { Dimensions, Modal, Pressable, View } from 'react-native';
import {
	Gesture,
	GestureDetector,
	GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
	Extrapolation,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { scheduleOnRN } from 'react-native-worklets';

import { SneakersModal } from '@/components/ui/modals/SneakersModal';
import { useModalStore } from '@/store/useModalStore';

const { height: screenHeight } = Dimensions.get('window');
const MODAL_HEIGHT = screenHeight * 0.8;

const ANIMATION_CONFIG = {
	open: {
		duration: 300,
	},
	close: {
		duration: 200,
	},
	spring: {
		damping: 20,
		stiffness: 300,
		mass: 0.8,
	},
};

export default function SneakersModalWrapper() {
	const isVisible = useModalStore((state) => state.isVisible);
	const setIsVisible = useModalStore((state) => state.setIsVisible);
	const resetModalData = useModalStore((state) => state.resetModalData);

	const translateY = useSharedValue(MODAL_HEIGHT);
	const isClosingRef = useRef(false);
	const [localVisible, setLocalVisible] = useState(false);

	const closeModalActions = useCallback(() => {
		if (isClosingRef.current) {
			return;
		}

		isClosingRef.current = true;

		setLocalVisible(false);

		setTimeout(() => {
			setIsVisible(false);
			isClosingRef.current = false;
		}, 300);
	}, [setIsVisible]);

	const handleCloseModal = useCallback(() => {
		if (isClosingRef.current || !localVisible) {
			return;
		}

		translateY.value = withTiming(
			MODAL_HEIGHT,
			ANIMATION_CONFIG.close,
			(finished) => {
				if (finished) {
					scheduleOnRN(closeModalActions);
				}
			}
		);
	}, [translateY, closeModalActions, localVisible]);

	const panGesture = Gesture.Pan()
		.onUpdate((event) => {
			translateY.value = Math.max(0, event.translationY);
		})
		.onEnd((event) => {
			const shouldClose =
				event.translationY > MODAL_HEIGHT * 0.25 ||
				event.velocityY > 800;

			if (shouldClose) {
				translateY.value = withTiming(
					MODAL_HEIGHT,
					ANIMATION_CONFIG.close,
					(finished) => {
						if (finished) {
							scheduleOnRN(closeModalActions);
						}
					}
				);
			} else {
				translateY.value = withSpring(0, ANIMATION_CONFIG.spring);
			}
		});

	const modalStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: translateY.value,
				},
			],
		};
	});

	const overlayStyle = useAnimatedStyle(() => {
		const opacity = interpolate(
			translateY.value,
			[0, MODAL_HEIGHT],
			[0.5, 0],
			Extrapolation.CLAMP
		);

		return {
			opacity,
		};
	});

	useEffect(() => {
		if (isVisible) {
			setLocalVisible(true);
			isClosingRef.current = false;
			translateY.value = withTiming(0, ANIMATION_CONFIG.open);
		}
	}, [isVisible, translateY]);

	useEffect(() => {
		if (!isVisible && localVisible) {
			setLocalVisible(false);
		}
	}, [isVisible, localVisible]);

	return (
		<Modal
			animationType="fade"
			transparent={true}
			visible={localVisible}
			onRequestClose={handleCloseModal}
			statusBarTranslucent={true}
		>
			<GestureHandlerRootView className="flex-1">
				<Animated.View className="flex-1 bg-black" style={overlayStyle}>
					<Pressable className="flex-1" onPress={handleCloseModal} />
				</Animated.View>

				<Animated.View
					className="absolute bottom-0 left-0 right-0"
					style={[
						modalStyle,
						{
							height: MODAL_HEIGHT,
						},
					]}
				>
					<View className="w-full items-center pt-3 pb-2">
						<View className="w-24 h-1 bg-gray-300 rounded-full" />
					</View>
					<GestureDetector gesture={panGesture}>
						<Animated.View className="flex-1 bg-background rounded-t-3xl">
							<View className="flex-1 px-4 py-3">
								<SneakersModal />
							</View>
						</Animated.View>
					</GestureDetector>
				</Animated.View>

				<Toast topOffset={60} />
			</GestureHandlerRootView>
		</Modal>
	);
}
