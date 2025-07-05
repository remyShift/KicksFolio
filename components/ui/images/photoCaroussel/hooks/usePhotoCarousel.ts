import { useRef, useState } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
	runOnJS,
	useAnimatedScrollHandler,
	useSharedValue,
} from 'react-native-reanimated';
import { Photo } from '@/types/Sneaker';

export const usePhotoCarousel = (photos: Photo[]) => {
	const scrollX = useSharedValue(0);
	const flatListRef = useRef<Animated.FlatList<Photo>>(null);
	const screenWidth = Dimensions.get('window').width;
	const [carouselWidth, setCarouselWidth] = useState(screenWidth);
	const [currentIndex, setCurrentIndex] = useState(0);

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollX.value = event.contentOffset.x;
			const index = Math.round(event.contentOffset.x / carouselWidth);
			runOnJS(setCurrentIndex)(index);
		},
	});

	const scrollToIndex = (index: number) => {
		if (flatListRef.current && index >= 0 && index < photos.length) {
			flatListRef.current.scrollToIndex({ index, animated: true });
			setCurrentIndex(index);
		}
	};

	const onAccessibilityAction = (event: any) => {
		switch (event.nativeEvent.actionName) {
			case 'increment':
				if (currentIndex < photos.length - 1) {
					scrollToIndex(currentIndex + 1);
				}
				break;
			case 'decrement':
				if (currentIndex > 0) {
					scrollToIndex(currentIndex - 1);
				}
				break;
		}
	};

	return {
		scrollX,
		flatListRef,
		carouselWidth,
		setCarouselWidth,
		currentIndex,
		scrollHandler,
		scrollToIndex,
		onAccessibilityAction,
	};
};
