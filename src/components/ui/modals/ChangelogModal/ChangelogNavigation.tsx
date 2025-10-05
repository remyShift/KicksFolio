import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

interface ChangelogNavigationProps {
	isFirstSlide: boolean;
	isLastSlide: boolean;
	onPrevious: () => void;
	onNext: () => void;
}

export function ChangelogNavigation({
	isFirstSlide,
	isLastSlide,
	onPrevious,
	onNext,
}: ChangelogNavigationProps) {
	return (
		<View className="flex-row gap-3">
			{!isFirstSlide && (
				<TouchableOpacity
					onPress={onPrevious}
					className="flex-1 p-2 rounded-md items-center border-2 border-primary"
					activeOpacity={0.8}
				>
					<Text className="text-primary font-open-sans-bold text-base">
						Précédent
					</Text>
				</TouchableOpacity>
			)}

			<TouchableOpacity
				onPress={onNext}
				className={`p-2 rounded-md items-center bg-primary ${!isFirstSlide ? 'flex-1' : 'flex-1'}`}
				activeOpacity={0.8}
				style={isFirstSlide ? { flex: 1 } : undefined}
			>
				<Text className="text-white font-open-sans-bold text-base">
					{isLastSlide ? 'Commencer' : 'Suivant'}
				</Text>
			</TouchableOpacity>
		</View>
	);
}
