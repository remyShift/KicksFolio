import { memo, useCallback, useEffect, useMemo } from 'react';

import { Dimensions } from 'react-native';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';

import { useSwipeOptimization } from '@/components/screens/app/profile/hooks/useSwipeOptimization';
import { Sneaker } from '@/types/sneaker';

const { width: screenWidth } = Dimensions.get('window');
const BUTTON_WIDTH = 80;
const BUTTON_GAP = 8;
const SWIPE_ANIMATION_DURATION = 250;
const VERTICAL_SCROLL_THRESHOLD = 30;

interface SwipeableWrapperProps {
	item: Sneaker;
	showOwnerInfo?: boolean;
	userSneakers?: Sneaker[];
	onCloseRow?: () => void;
	customSwipeActions?: React.ComponentType<{
		sneaker: Sneaker;
		closeRow: () => void;
		userSneakers?: Sneaker[];
		isOwner?: boolean;
	}>;
	customMainContent?: React.ComponentType<{
		sneaker: Sneaker;
		showOwnerInfo?: boolean;
	}>;
	getIsOwner?: (item: Sneaker) => boolean;
}

function SwipeableWrapper({
	item,
	showOwnerInfo = false,
	userSneakers,
	onCloseRow,
	customSwipeActions,
	customMainContent,
	getIsOwner,
}: SwipeableWrapperProps) {
	const { isRowOpen, setOpenRow, closeRow } = useSwipeOptimization();

	const translateX = useSharedValue(0);
	const isOpen = useMemo(() => isRowOpen(item.id), [isRowOpen, item.id]);

	const isOwner = useMemo(() => {
		if (getIsOwner) {
			return getIsOwner(item);
		}
		return false;
	}, [getIsOwner, item]);

	const maxOpenWidth = useMemo(() => {
		const buttonCount = isOwner ? 2 : 1;
		const width =
			buttonCount * BUTTON_WIDTH + (buttonCount - 1) * BUTTON_GAP;
		return width;
	}, [isOwner]);

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
				const { translationX, velocityX } = event;

				const shouldOpen =
					translationX < -(maxOpenWidth / 2) || velocityX < -500;

				if (shouldOpen) {
					translateX.value = withTiming(-maxOpenWidth, {
						duration: SWIPE_ANIMATION_DURATION,
						easing: (t) => Math.pow(t, 0.8),
					});
					runOnJS(setOpenRow)(item.id);
				} else {
					translateX.value = withTiming(0, {
						duration: SWIPE_ANIMATION_DURATION,
						easing: (t) => Math.pow(t, 0.8),
					});
					runOnJS(closeRow)(item.id);
				}
			});
	}, [translateX, setOpenRow, closeRow, item.id, maxOpenWidth]);

	useEffect(() => {
		if (!isOpen) {
			translateX.value = withTiming(0, {
				duration: SWIPE_ANIMATION_DURATION,
			});
		}
	}, [isOpen, translateX]);

	const handleSwipeClose = useCallback(() => {
		translateX.value = withTiming(
			0,
			{
				duration: SWIPE_ANIMATION_DURATION,
			},
			(finished) => {
				if (finished) {
					runOnJS(closeRow)(item.id);
					if (onCloseRow) {
						runOnJS(onCloseRow)();
					}
				}
			}
		);
	}, [translateX, closeRow, item.id, onCloseRow]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}));

	const SwipeActionsComponent = customSwipeActions;
	const MainContentComponent = customMainContent;

	if (!SwipeActionsComponent || !MainContentComponent) {
		console.warn(
			'SwipeableWrapper: customSwipeActions et customMainContent sont requis'
		);
		return null;
	}

	const swipeableContent = useMemo(
		() => (
			<SwipeActionsComponent
				sneaker={item}
				closeRow={handleSwipeClose}
				userSneakers={userSneakers}
				isOwner={isOwner}
			/>
		),
		[item, handleSwipeClose, userSneakers, isOwner, SwipeActionsComponent]
	);

	const mainContent = useMemo(
		() => (
			<View
				className="flex-1 bg-white"
				style={{ backgroundColor: '#ffffff', flex: 1 }}
			>
				<MainContentComponent
					sneaker={item}
					showOwnerInfo={showOwnerInfo}
				/>
			</View>
		),
		[item, showOwnerInfo, MainContentComponent]
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
					style={[
						{
							width: screenWidth,
							backgroundColor: '#ffffff',
							flex: 1,
						},
						animatedStyle,
					]}
				>
					{mainContent}
				</Animated.View>
			</GestureDetector>
		</View>
	);
}

export default memo(SwipeableWrapper);
