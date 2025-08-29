import { Text, View } from 'react-native';

import { Image } from 'expo-image';

import Feather from '@expo/vector-icons/Feather';

export default function FollowingTitle({
	content,
	userAvatar,
}: {
	content: string;
	userAvatar: string | null;
}) {
	return (
		<View className="w-full flex justify-center overflow-hidden">
			<Text className="font-syne-extrabold w-[200%] text-4xl text-primary opacity-15 absolute">
				{content.toUpperCase()}
			</Text>
			<View className="flex flex-row justify-between items-center px-6">
				<View className="flex gap-0">
					<Text className="font-syne-extrabold text-lg leading-none text-gray-900">
						@{content}
					</Text>
				</View>

				{userAvatar ? (
					<Image
						source={userAvatar}
						style={{
							width: 32,
							height: 32,
							borderRadius: 20,
							borderWidth: 1,
							borderColor: '#F27329',
						}}
						contentFit="contain"
						contentPosition="center"
						cachePolicy="memory-disk"
						transition={200}
					/>
				) : (
					<View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
						<Feather name="user" size={14} color="white" />
					</View>
				)}
			</View>
		</View>
	);
}
