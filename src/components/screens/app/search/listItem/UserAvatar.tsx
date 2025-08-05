import { View } from 'react-native';

import { Image } from 'expo-image';

import { Feather } from '@expo/vector-icons';

import { SearchUser } from '@/domain/UserSearchProvider';

interface UserAvatarProps {
	searchUser: SearchUser;
}

export default function UserAvatar({ searchUser }: UserAvatarProps) {
	return (
		<View className="mr-4">
			{searchUser.profile_picture ? (
				<Image
					source={{
						uri: searchUser.profile_picture,
					}}
					style={{
						width: 50,
						height: 50,
						borderRadius: 25,
					}}
					contentFit="cover"
					cachePolicy="memory-disk"
				/>
			) : (
				<View className="w-12 h-12 bg-gray-300 rounded-full items-center justify-center">
					<Feather name="user" size={24} color="#666" />
				</View>
			)}
		</View>
	);
}
