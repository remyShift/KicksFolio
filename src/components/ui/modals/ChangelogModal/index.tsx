import React, { useEffect, useRef, useState } from 'react';

import {
	Dimensions,
	FlatList,
	Modal,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import Animated, {
	interpolate,
	interpolateColor,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
} from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';

import { ChangelogSlide } from '@/types/changelog';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_WIDTH = SCREEN_WIDTH * 0.9;
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;

interface ChangelogModalProps {
	visible: boolean;
	slides: ChangelogSlide[];
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

	const renderSlide = ({ item }: { item: ChangelogSlide }) => (
		<View
			style={{ width: MODAL_WIDTH }}
			className="flex-1 items-center justify-center px-8"
		>
			{item.icon && (
				<View className="mb-8 bg-primary/10 p-6 rounded-full">
					<Ionicons name={item.icon} size={64} color="#F27329" />
				</View>
			)}

			<Text className="text-3xl font-open-sans-bold text-center mb-4">
				{item.title}
			</Text>

			<Text className="text-base font-open-sans text-center text-gray-600 leading-6">
				{item.description}
			</Text>
		</View>
	);

	const Dot = ({ index }: { index: number }) => {
		const animatedStyle = useAnimatedStyle(() => {
			const inputRange = [
				(index - 1) * MODAL_WIDTH,
				index * MODAL_WIDTH,
				(index + 1) * MODAL_WIDTH,
			];

			const width = interpolate(scrollX.value, inputRange, [8, 32, 8], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			});

			const backgroundColor = interpolateColor(
				scrollX.value,
				inputRange,
				['#d1d5db', '#F27329', '#d1d5db']
			);

			return {
				width,
				backgroundColor,
			};
		});

		return (
			<Animated.View
				style={animatedStyle}
				className="h-2 rounded-full mx-1"
			/>
		);
	};

	const renderDots = () => (
		<View className="flex-row justify-center items-center mb-6">
			{slides.map((_, index) => (
				<Dot key={index} index={index} />
			))}
		</View>
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
					<View className="px-6 pt-6 pb-4 border-b border-gray-200">
						<View className="flex-row justify-between items-center">
							<Text className="text-sm font-open-sans-semibold text-gray-500">
								Version {version}
							</Text>
							<TouchableOpacity
								onPress={onClose}
								className="w-8 h-8 items-center justify-center"
							>
								<Ionicons
									name="close"
									size={24}
									color="#9ca3af"
								/>
							</TouchableOpacity>
						</View>
					</View>

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
						{renderDots()}

						<View className="flex-row gap-3">
							{!isFirstSlide && (
								<TouchableOpacity
									onPress={handlePrevious}
									className="flex-1 py-4 rounded-xl items-center border-2 border-primary"
									activeOpacity={0.8}
								>
									<Text className="text-primary font-open-sans-bold text-base">
										Précédent
									</Text>
								</TouchableOpacity>
							)}

							<TouchableOpacity
								onPress={handleNext}
								className={`py-4 rounded-xl items-center bg-primary ${!isFirstSlide ? 'flex-1' : 'flex-1'}`}
								activeOpacity={0.8}
								style={isFirstSlide ? { flex: 1 } : undefined}
							>
								<Text className="text-white font-open-sans-bold text-base">
									{isLastSlide ? 'Commencer' : 'Suivant'}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</View>
		</Modal>
	);
}
