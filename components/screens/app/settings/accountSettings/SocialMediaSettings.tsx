import { View, Text, TextInput, Switch } from 'react-native';
import { useState } from 'react';
import { useSession } from '@/context/authContext';
import { useAuth } from '@/hooks/useAuth';
import MainButton from '@/components/ui/buttons/MainButton';
import useToast from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';

export default function SocialMediaSettings() {
    const { t } = useTranslation();
    const { user, refreshUserData } = useSession();
    const { updateUser } = useAuth();
    const { showSuccessToast, showErrorToast } = useToast();
    
    const [instagramUsername, setInstagramUsername] = useState(user?.instagram_username || '');
    const [facebookUsername, setFacebookUsername] = useState(user?.facebook_username || '');
    const [isVisible, setIsVisible] = useState(user?.social_media_visibility ?? true);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = () => {
        if (!user) return;
        
        setIsLoading(true);
        
        updateUser(user.id, {
            instagram_username: instagramUsername || undefined,
            facebook_username: facebookUsername || undefined,
            social_media_visibility: isVisible
        })
        .then((result) => {
            if (result?.user) {
                refreshUserData();
                showSuccessToast(
                    t('settings.socialMedia.updated'),
                    t('settings.socialMedia.updatedDescription')
                );
            }
        })
        .catch((error) => {
            showErrorToast(
                t('settings.socialMedia.updateFailed'),
                t('settings.socialMedia.updateFailedDescription')
            );
            console.error('Error updating social media settings:', error);
        })
        .finally(() => {
            setIsLoading(false);
        });
    };

    return (
        <View className="gap-6 p-4 bg-white rounded-lg">
            <Text className="font-open-sans-bold text-xl text-center">
                {t('settings.socialMedia.title')}
            </Text>
            
            <View className="gap-4">
                <View>
                    <Text className="font-open-sans-bold text-base mb-2">
                        {t('settings.socialMedia.instagram')}
                    </Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3"
                        placeholder={t('settings.socialMedia.instagramPlaceholder')}
                        value={instagramUsername}
                        onChangeText={setInstagramUsername}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
                
                <View>
                    <Text className="font-open-sans-bold text-base mb-2">
                        {t('settings.socialMedia.facebook')}
                    </Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3"
                        placeholder={t('settings.socialMedia.facebookPlaceholder')}
                        value={facebookUsername}
                        onChangeText={setFacebookUsername}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
                
                <View className="flex-row items-center justify-between">
                    <Text className="font-open-sans text-base">
                        {t('settings.socialMedia.visibility')}
                    </Text>
                    <Switch
                        value={isVisible}
                        onValueChange={setIsVisible}
                        trackColor={{ false: '#767577', true: '#F27329' }}
                        thumbColor={isVisible ? '#ffffff' : '#f4f3f4'}
                    />
                </View>
            </View>
            
            <MainButton
                content={t('settings.buttons.save')}
                backgroundColor={isLoading ? 'bg-primary/50' : 'bg-primary'}
                onPressAction={handleSave}
                isDisabled={isLoading}
            />
        </View>
    );
} 