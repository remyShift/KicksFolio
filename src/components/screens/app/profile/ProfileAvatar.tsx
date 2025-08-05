import { View } from 'react-native';

import { Image } from 'expo-image';

import Feather from '@expo/vector-icons/Feather';

export default function ProfileAvatar({
	profilePictureUrl,
}: {
	profilePictureUrl: string | null;
}) {
	return profilePictureUrl ? (
		<View className="w-24 h-24 rounded-full">
			<Image
				source={{
					uri: profilePictureUrl,
				}}
				style={{
					width: '100%',
					height: '100%',
					borderRadius: 100,
					borderWidth: 2,
					borderColor: '#F27329',
				}}
				contentFit="cover"
				contentPosition="center"
				cachePolicy="memory-disk"
			/>
		</View>
	) : (
		<View className="w-24 h-24 bg-gray-300 border-2 border-gray-400 rounded-full items-center justify-center">
			<Feather name="user" size={40} color="white" />
		</View>
	);
}
