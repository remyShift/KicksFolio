import { useState } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { useSplashScreenStore } from '@/store/useSplashScreenStore';

import { ShoeIcon } from '../../ui/icons/ShoeIcon';
import { AppTitle } from './AppTitle';

export default function SplashScreen() {
	const [debugClicks, setDebugClicks] = useState(0);
	const { setIsVisible, setIsInitialized } = useSplashScreenStore();

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
				<ShoeIcon name="shoe-sneaker" size={50} color="white" />
			</TouchableOpacity>
			{debugClicks > 0 && (
				<Text className="text-white text-xs mt-4 opacity-50">
					Debug: {debugClicks}/5
				</Text>
			)}
		</View>
	);
}
