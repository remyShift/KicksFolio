import { useEffect, useRef, useState } from 'react';

import { Dimensions, FlatList, Modal, View } from 'react-native';
import Animated, {
	useAnimatedScrollHandler,
	useSharedValue,
} from 'react-native-reanimated';

import { ChangelogSlide as ChangelogSlideType } from '@/types/changelog';

import { ChangelogDots } from './ChangelogDots';
import ChangelogHeader from './ChangelogHeader';
import { ChangelogNavigation } from './ChangelogNavigation';
import { ChangelogSlide } from './ChangelogSlide';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_WIDTH = SCREEN_WIDTH * 0.9;
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.75;

interface ChangelogModalProps {
	visible: boolean;
	slides: ChangelogSlideType[];
	onClose: () => void;
	version: string;
}

export function ChangelogModal({
	visible,
	slides,
	onClose,
	version,
}: ChangelogModalProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const flatListRef = useRef<FlatList>(null);
	const scrollX = useSharedValue(0);

	const isFirstSlide = currentIndex === 0;
	const isLastSlide = currentIndex === slides.length - 1;

	useEffect(() => {
		if (visible) {
			setCurrentIndex(0);
			scrollX.value = 0;
			setTimeout(() => {
				flatListRef.current?.scrollToIndex({
					index: 0,
					animated: false,
				});
			}, 100);
		}
	}, [visible]);

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollX.value = event.contentOffset.x;
		},
	});

	const handleNext = () => {
		if (isLastSlide) {
			onClose();
		} else {
			const nextIndex = currentIndex + 1;
			flatListRef.current?.scrollToIndex({
				index: nextIndex,
				animated: true,
			});
			setCurrentIndex(nextIndex);
		}
	};

	const handlePrevious = () => {
		if (!isFirstSlide) {
			const prevIndex = currentIndex - 1;
			flatListRef.current?.scrollToIndex({
				index: prevIndex,
				animated: true,
			});
			setCurrentIndex(prevIndex);
		}
	};

	const handleScroll = (event: any) => {
		const offsetX = event.nativeEvent.contentOffset.x;
		const index = Math.round(offsetX / MODAL_WIDTH);
		setCurrentIndex(index);
	};

	const renderSlide = ({ item }: { item: ChangelogSlideType }) => (
		<ChangelogSlide item={item} width={MODAL_WIDTH} />
	);

	if (!visible) return null;

	return (
		<Modal
			visible={visible}
			animationType="fade"
			transparent={true}
			onRequestClose={onClose}
		>
			<View className="flex-1 bg-black/50 items-center justify-center">
				<View
					style={{
						width: MODAL_WIDTH,
						height: MODAL_HEIGHT,
					}}
					className="bg-white rounded-3xl overflow-hidden shadow-2xl"
				>
					<ChangelogHeader version={version} onClose={onClose} />

					<View className="flex-1">
						<Animated.FlatList
							ref={flatListRef}
							data={slides}
							renderItem={renderSlide}
							horizontal
							pagingEnabled
							showsHorizontalScrollIndicator={false}
							scrollEnabled={true}
							keyExtractor={(item) => item.id}
							onScrollToIndexFailed={() => {}}
							onMomentumScrollEnd={handleScroll}
							onScroll={scrollHandler}
							scrollEventThrottle={16}
							bounces={false}
						/>
					</View>

					<View className="px-6 pb-6">
						<ChangelogDots
							slidesCount={slides.length}
							scrollX={scrollX}
							modalWidth={MODAL_WIDTH}
						/>

						<ChangelogNavigation
							isFirstSlide={isFirstSlide}
							isLastSlide={isLastSlide}
							onPrevious={handlePrevious}
							onNext={handleNext}
						/>
					</View>
				</View>
			</View>
		</Modal>
	);
}
