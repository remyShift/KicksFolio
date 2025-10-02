import { useState } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { useSplashScreenStore } from '@/store/useSplashScreenStore';

import { AnimatedShoeIcon } from './AnimatedShoeIcon';
import { AppTitle } from './AppTitle';
import { LoadingProgress } from './LoadingProgress';
import { LoadingStatus } from './LoadingStatus';

export default function SplashScreen() {
	const [debugClicks, setDebugClicks] = useState(0);
	const { setIsVisible, setIsInitialized, loadingProgress, loadingStatus } =
		useSplashScreenStore();

	const handleDebugPress = () => {
		const newCount = debugClicks + 1;
		setDebugClicks(newCount);

		if (newCount >= 5) {
			console.log(
				'[SplashScreen] Debug mode activated - forcing app to continue'
			);
			setIsInitialized(true);
			setIsVisible(false);
			setDebugClicks(0);
		}
	};

	return (
		<View className="flex-1 items-center justify-center bg-primary gap-1">
			<AppTitle text="KicksFolio" />
			<TouchableOpacity onPress={handleDebugPress} activeOpacity={1}>
				<AnimatedShoeIcon name="shoe-sneaker" size={50} color="white" />
			</TouchableOpacity>
			<LoadingProgress progress={loadingProgress} />
			<LoadingStatus status={loadingStatus} />
			{debugClicks > 0 && (
				<Text className="text-white text-xs mt-4 opacity-50">
					Debug: {debugClicks}/5
				</Text>
			)}
		</View>
	);
}
