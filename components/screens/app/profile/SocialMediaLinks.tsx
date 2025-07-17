import { View, Text, TouchableOpacity, Linking } from 'react-native';
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

    const handleFacebookPress = () => {
        if (user.facebook_username) {
            Linking.openURL(`https://facebook.com/${user.facebook_username}`)
                .catch(err => console.error('Error opening Facebook:', err));
        }
    };

    if (!user.social_media_visibility && !isOwnProfile) {
        return null;
    }

    const hasAnyLink = user.instagram_username || user.facebook_username;

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
        <View className="bg-white p-4 rounded-lg border border-gray-200">
            <Text className="font-open-sans-bold text-lg mb-3 text-center">
                {t('social.contactUser')}
            </Text>
            
            <View className="flex-row justify-center gap-6">
                {user.instagram_username && (
                    <TouchableOpacity 
                        onPress={handleInstagramPress}
                        className="flex-row items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg"
                    >
                        <Ionicons name="logo-instagram" size={24} color="white" />
                        <Text className="text-white font-medium">Instagram</Text>
                    </TouchableOpacity>
                )}
                
                {user.facebook_username && (
                    <TouchableOpacity 
                        onPress={handleFacebookPress}
                        className="flex-row items-center gap-2 bg-blue-600 p-3 rounded-lg"
                    >
                        <Ionicons name="logo-facebook" size={24} color="white" />
                        <Text className="text-white font-medium">Facebook</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
} 