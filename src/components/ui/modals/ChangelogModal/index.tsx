import React, { useRef, useState } from 'react';

import {
	Dimensions,
	FlatList,
	Modal,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ChangelogSlide } from '@/types/changelog';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

	const isLastSlide = currentIndex === slides.length - 1;

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

	const handleSkip = () => {
		onClose();
	};

	const renderSlide = ({ item }: { item: ChangelogSlide }) => (
		<View
			style={{ width: SCREEN_WIDTH }}
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

	const renderDots = () => (
		<View className="flex-row justify-center items-center mb-8">
			{slides.map((_, index) => (
				<View
					key={index}
					className={`h-2 rounded-full mx-1 ${
						index === currentIndex
							? 'bg-primary w-8'
							: 'bg-gray-300 w-2'
					}`}
				/>
			))}
		</View>
	);

	if (!visible) return null;

	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent={false}
			onRequestClose={onClose}
		>
			<View className="flex-1 bg-white">
				<View className="pt-12 px-6 pb-4 border-b border-gray-200">
					<View className="flex-row justify-between items-center">
						<Text className="text-sm font-open-sans-semibold text-gray-500">
							Version {version}
						</Text>
						{!isLastSlide && (
							<TouchableOpacity onPress={handleSkip}>
								<Text className="text-sm font-open-sans-semibold text-primary">
									Passer
								</Text>
							</TouchableOpacity>
						)}
					</View>
				</View>

				<View className="flex-1">
					<FlatList
						ref={flatListRef}
						data={slides}
						renderItem={renderSlide}
						horizontal
						pagingEnabled
						showsHorizontalScrollIndicator={false}
						scrollEnabled={false}
						keyExtractor={(item) => item.id}
						onScrollToIndexFailed={() => {}}
					/>
				</View>

				<View className="px-6 pb-8">
					{renderDots()}

					<TouchableOpacity
						onPress={handleNext}
						className="bg-primary py-4 rounded-xl items-center"
						activeOpacity={0.8}
					>
						<Text className="text-white font-open-sans-bold text-base">
							{isLastSlide ? 'Commencer' : 'Suivant'}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}
