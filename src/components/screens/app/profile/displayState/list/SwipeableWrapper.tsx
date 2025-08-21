import { memo, useCallback, useEffect, useMemo } from 'react';

import { Dimensions, StyleSheet } from 'react-native';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';

import { useSwipeOptimization } from '@/components/screens/app/profile/displayState/list/hooks/useSwipeOptimization';
import { Sneaker } from '@/types/sneaker';

import SneakerListItem from './SneakerListItem';
import SwipeActions from './SwipeActions';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;
const SWIPE_ANIMATION_DURATION = 250;
const HORIZONTAL_SWIPE_THRESHOLD = 50;
const VERTICAL_SCROLL_THRESHOLD = 30;

interface SwipeableWrapperProps {
	item: Sneaker;
	showOwnerInfo?: boolean;
	userSneakers?: Sneaker[];
	onCloseRow?: () => void;
	isOwner?: boolean;
}

function SwipeableWrapper({
	item,
	showOwnerInfo = false,
	userSneakers,
	onCloseRow,
	isOwner = false,
}: SwipeableWrapperProps) {
	const { isRowOpen, setOpenRow, closeRow } = useSwipeOptimization();

	const translateX = useSharedValue(0);
	const isOpen = useMemo(() => isRowOpen(item.id), [isRowOpen, item.id]);

	const maxOpenWidth = useMemo(() => {
		return isOwner ? SWIPE_THRESHOLD * 2 : SWIPE_THRESHOLD;
	}, [isOwner]);

	const animateToPosition = useCallback(
		(toValue: number) => {
			translateX.value = withTiming(toValue, {
				duration: SWIPE_ANIMATION_DURATION,
			});
		},
		[translateX]
	);

	const panGesture = useMemo(() => {
		return Gesture.Pan()
			.activeOffsetX([-(maxOpenWidth / 3), maxOpenWidth / 3])
			.failOffsetY([
				-VERTICAL_SCROLL_THRESHOLD,
				VERTICAL_SCROLL_THRESHOLD,
			])
			.onUpdate((event) => {
				const { translationX } = event;

				const newTranslateX = Math.min(
					0,
					Math.max(-maxOpenWidth, translationX)
				);
				translateX.value = newTranslateX;
			})
			.onEnd((event) => {
				const { translationX } = event;

				const shouldOpen = translationX < -(maxOpenWidth / 2);

				if (shouldOpen) {
					translateX.value = withTiming(-maxOpenWidth, {
						duration: SWIPE_ANIMATION_DURATION,
					});
					runOnJS(setOpenRow)(item.id);
				} else {
					translateX.value = withTiming(0, {
						duration: SWIPE_ANIMATION_DURATION,
					});
					runOnJS(closeRow)(item.id);
				}
			});
	}, [translateX, setOpenRow, closeRow, item.id, maxOpenWidth]);

	useEffect(() => {
		if (!isOpen) {
			animateToPosition(0);
		}
	}, [isOpen, animateToPosition]);

	const handleSwipeClose = useCallback(() => {
		animateToPosition(0);
		closeRow(item.id);
		onCloseRow?.();
	}, [animateToPosition, closeRow, item.id, onCloseRow]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}));

	const swipeableContent = useMemo(
		() => (
			<SwipeActions
				sneaker={item}
				closeRow={handleSwipeClose}
				userSneakers={userSneakers}
				isOwner={isOwner}
			/>
		),
		[item, handleSwipeClose, userSneakers, isOwner]
	);

	const mainContent = useMemo(
		() => (
			<View className="flex-1 bg-white">
				<SneakerListItem sneaker={item} showOwnerInfo={showOwnerInfo} />
			</View>
		),
		[item, showOwnerInfo]
	);

	return (
		<View
			className="flex-1 relative overflow-hidden"
			style={{ width: screenWidth }}
		>
			{swipeableContent}
			<GestureDetector gesture={panGesture}>
				<Animated.View
					className="flex-1"
					style={[{ width: screenWidth }, animatedStyle]}
				>
					{mainContent}
				</Animated.View>
			</GestureDetector>
		</View>
	);
}

export default memo(SwipeableWrapper);
