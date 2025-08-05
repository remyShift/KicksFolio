import { Linking, Pressable, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { SearchUser } from '@/src/domain/UserSearchProvider';
import { User } from '@/types/user';

interface SocialMediaLinksProps {
	user: User | SearchUser;
	isOwnProfile?: boolean;
}

export default function SocialMediaLinks({
	user,
	isOwnProfile = false,
}: SocialMediaLinksProps) {
	const handleInstagramPress = () => {
		if (user.instagram_username) {
			Linking.openURL(
				`https://instagram.com/${user.instagram_username}`
			).catch((err) => console.error('Error opening Instagram:', err));
		}
	};

	if (!user.social_media_visibility) {
		return null;
	}

	return (
		<View className="flex-row justify-center gap-2">
			{user.instagram_username && (
				<Pressable onPress={handleInstagramPress}>
					<Ionicons name="logo-instagram" size={26} color="#F27329" />
				</Pressable>
			)}
		</View>
	);
}
