import { memo, useCallback, useMemo } from 'react';

import { Animated, Dimensions, StyleSheet } from 'react-native';
import { View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

import { useSwipeOptimization } from '@/hooks/useSwipeOptimization';
import { Sneaker } from '@/types/sneaker';

import SneakerListItem from '../profile/displayState/list/SneakerListItem';
import WishlistSwipeActions from './WishlistSwipeActions';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;
const SWIPE_ANIMATION_DURATION = 250;

interface WishlistSwipeItemListProps {
	item: Sneaker;
	showOwnerInfo?: boolean;
	onCloseRow?: () => void;
}

function WishlistSwipeItemList({
	item,
	showOwnerInfo = false,
	onCloseRow,
}: WishlistSwipeItemListProps) {
	const { isRowOpen, setOpenRow, closeRow } = useSwipeOptimization();

	const translateX = useMemo(() => new Animated.Value(0), []);
	const isOpen = useMemo(() => isRowOpen(item.id), [isRowOpen, item.id]);

	const animateToPosition = useCallback(
		(toValue: number) => {
			Animated.timing(translateX, {
				toValue,
				duration: SWIPE_ANIMATION_DURATION,
				useNativeDriver: true,
			}).start();
		},
		[translateX]
	);

	const handleGestureEvent = useCallback(
		(event: any) => {
			const { translationX, state } = event.nativeEvent;

			if (state === State.ACTIVE) {
				const newTranslateX = Math.min(
					0,
					Math.max(-SWIPE_THRESHOLD * 2, translationX)
				);
				translateX.setValue(newTranslateX);
			} else if (state === State.END) {
				const shouldOpen = translationX < -SWIPE_THRESHOLD;

				if (shouldOpen) {
					animateToPosition(-SWIPE_THRESHOLD);
					setOpenRow(item.id);
				} else {
					animateToPosition(0);
					closeRow(item.id);
				}
			}
		},
		[translateX, animateToPosition, setOpenRow, closeRow, item.id]
	);

	// Auto-close when another row opens
	useMemo(() => {
		if (!isOpen && translateX._value !== 0) {
			animateToPosition(0);
		}
	}, [isOpen, translateX._value, animateToPosition]);

	const handleSwipeClose = useCallback(() => {
		animateToPosition(0);
		closeRow(item.id);
		onCloseRow?.();
	}, [animateToPosition, closeRow, item.id, onCloseRow]);

	const swipeableContent = useMemo(
		() => (
			<View style={styles.swipeableContent}>
				<WishlistSwipeActions sneaker={item} />
			</View>
		),
		[item]
	);

	const mainContent = useMemo(
		() => (
			<View style={styles.mainContent}>
				<SneakerListItem sneaker={item} showOwnerInfo={showOwnerInfo} />
			</View>
		),
		[item, showOwnerInfo]
	);

	return (
		<View style={styles.container}>
			{swipeableContent}
			<PanGestureHandler
				onGestureEvent={handleGestureEvent}
				activeOffsetX={[-10, 10]}
			>
				<Animated.View
					style={[
						styles.animatedContainer,
						{
							transform: [{ translateX }],
						},
					]}
				>
					{mainContent}
				</Animated.View>
			</PanGestureHandler>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: 'relative',
		overflow: 'hidden',
	},
	swipeableContent: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: '#f8f9fa',
		justifyContent: 'center',
		alignItems: 'flex-end',
		paddingRight: 16,
	},
	mainContent: {
		backgroundColor: 'white',
	},
	animatedContainer: {
		width: screenWidth,
	},
});

export default memo(WishlistSwipeItemList);
