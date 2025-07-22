import { View, Text, TouchableOpacity, Linking, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '@/types/User';
import { useTranslation } from 'react-i18next';

interface SocialMediaLinksProps {
    user: User;
    isOwnProfile?: boolean;
}

export default function SocialMediaLinks({ user, isOwnProfile = false }: SocialMediaLinksProps) {
    const { t } = useTranslation();

    const handleInstagramPress = () => {
        if (user.instagram_username) {
            Linking.openURL(`https://instagram.com/${user.instagram_username}`)
                .catch(err => console.error('Error opening Instagram:', err));
        }
    };

    if (!user.social_media_visibility && !isOwnProfile) {
        return null;
    }

    const hasAnyLink = user.instagram_username;

    if (!hasAnyLink) {
        return isOwnProfile ? (
            <View className="bg-gray-100 p-4 rounded-lg">
                <Text className="text-gray-600 text-center">
                    {t('social.noLinksConfigured')}
                </Text>
            </View>
        ) : null;
    }

    return (
        <View className="flex-row justify-center gap-2">
            {user.instagram_username && (
                <Pressable 
                    onPress={handleInstagramPress}
                >
                    <Ionicons name="logo-instagram" size={28} color="#F27329" />
                </Pressable>
            )}
        </View>
    );
} 