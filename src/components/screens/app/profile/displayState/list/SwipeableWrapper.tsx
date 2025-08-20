import { memo, useCallback, useEffect, useMemo } from 'react';

import { Animated, Dimensions, StyleSheet } from 'react-native';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useSwipeOptimization } from '@/components/screens/app/profile/displayState/list/hooks/useSwipeOptimization';
import DeleteButton from '@/components/ui/buttons/DeleteButton';
import EditButton from '@/components/ui/buttons/EditButton';
import { Sneaker } from '@/types/sneaker';

import SneakerListItem from './SneakerListItem';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;
const SWIPE_ANIMATION_DURATION = 250;
const HORIZONTAL_SWIPE_THRESHOLD = 20;
const VERTICAL_SCROLL_THRESHOLD = 10;

interface SwipeableWrapperProps {
	item: Sneaker;
	showOwnerInfo?: boolean;
	userSneakers?: Sneaker[];
	onCloseRow?: () => void;
}

function SwipeableWrapper({
	item,
	showOwnerInfo = false,
	userSneakers,
	onCloseRow,
}: SwipeableWrapperProps) {
	const { isRowOpen, setOpenRow, closeRow } = useSwipeOptimization();

	const translateX = useMemo(() => new Animated.Value(0), []);
	const isOpen = useMemo(() => isRowOpen(item.id), [isRowOpen, item.id]);

	const handleEdit = useCallback(() => {
		console.log('Edit sneaker:', item.id);
	}, [item.id]);

	const handleDelete = useCallback(() => {
		console.log('Delete sneaker:', item.id);
	}, [item.id]);

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

	const panGesture = useMemo(() => {
		return Gesture.Pan()
			.onUpdate((event) => {
				const { translationX, translationY } = event;

				const isHorizontalMovement =
					Math.abs(translationX) > Math.abs(translationY);
				const isSignificantHorizontalMovement =
					Math.abs(translationX) > HORIZONTAL_SWIPE_THRESHOLD;
				const isSignificantVerticalMovement =
					Math.abs(translationY) > VERTICAL_SCROLL_THRESHOLD;

				if (isSignificantVerticalMovement && !isHorizontalMovement) {
					return;
				}

				if (isSignificantHorizontalMovement) {
					const newTranslateX = Math.min(
						0,
						Math.max(-SWIPE_THRESHOLD * 2, translationX)
					);
					translateX.setValue(newTranslateX);
				}
			})
			.onEnd((event) => {
				const { translationX, translationY } = event;

				const isHorizontalMovement =
					Math.abs(translationX) > Math.abs(translationY);
				const isSignificantHorizontalMovement =
					Math.abs(translationX) > HORIZONTAL_SWIPE_THRESHOLD;
				const isSignificantVerticalMovement =
					Math.abs(translationY) > VERTICAL_SCROLL_THRESHOLD;

				if (isSignificantVerticalMovement && !isHorizontalMovement) {
					return;
				}

				if (isSignificantHorizontalMovement) {
					const shouldOpen = translationX < -SWIPE_THRESHOLD;

					if (shouldOpen) {
						animateToPosition(-SWIPE_THRESHOLD);
						setOpenRow(item.id);
					} else {
						animateToPosition(0);
						closeRow(item.id);
					}
				} else {
					animateToPosition(0);
					closeRow(item.id);
				}
			});
	}, [translateX, animateToPosition, setOpenRow, closeRow, item.id]);

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

	const swipeableContent = useMemo(
		() => (
			<View style={styles.swipeableContent}>
				<View style={styles.actionButtons}>
					<EditButton onPressAction={handleEdit} />
					<DeleteButton onPressAction={handleDelete} />
				</View>
			</View>
		),
		[handleEdit, handleDelete]
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
			<GestureDetector gesture={panGesture}>
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
			</GestureDetector>
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
	actionButtons: {
		flexDirection: 'row',
		gap: 8,
	},
	mainContent: {
		backgroundColor: 'white',
	},
	animatedContainer: {
		width: screenWidth,
	},
});

export default memo(SwipeableWrapper);
