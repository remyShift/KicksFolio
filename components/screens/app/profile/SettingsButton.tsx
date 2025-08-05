import { useCallback } from 'react';
import { Pressable, View } from 'react-native';

import { router } from 'expo-router';

import { SimpleLineIcons } from '@expo/vector-icons';

export default function SettingsButton() {
	const handleMenuPress = useCallback(() => {
		router.push('/settings');
	}, []);

	return (
		<View testID="profile-header">
			<Pressable
				className="p-4 absolute right-0 -top-0  z-50"
				onPress={handleMenuPress}
				testID="menu-button"
			>
				<SimpleLineIcons name="settings" size={24} color="black" />
			</Pressable>
		</View>
	);
}
