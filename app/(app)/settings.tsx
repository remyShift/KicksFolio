import { View, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from '@/context/authContext';
import SettingsMenuItem from '@/components/screens/app/settings/SettingsMenuItem';
import SettingsHeader from '@/components/screens/app/settings/SettingsHeader';
import SettingsCategory from '@/components/screens/app/settings/SettingsCategory';
import useToast from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';

export default function Settings() {
    const { t } = useTranslation();
    const { user } = useSession();
    const { logout, deleteAccount } = useAuth();
    const { showSuccessToast, showErrorToast } = useToast();

    const handleLogout = () => {
        Alert.alert(
            t('alert.titles.logout'),
            t('alert.descriptions.logout'),
            [
                {
                    text: t('alert.buttons.cancel'),
                    style: 'cancel'
                },
                {
                    text: t('alert.buttons.logout'),
                    style: 'destructive',
                    onPress: () => {
                        logout();
                        setTimeout(() => {
                            showSuccessToast(
                                t('alert.titles.loggedOut'),
                                t('alert.descriptions.loggedOut')
                            );
                        }, 200);
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            t('alert.titles.deleteAccount'),
            t('alert.descriptions.deleteAccount'),
            [
                {
                    text: t('alert.buttons.cancel'),
                    style: 'cancel'
                },
                {
                    text: t('alert.buttons.delete'),
                    style: 'destructive',
                    onPress: () => {
                        if (user) {
                            deleteAccount(user.id)
                                .then(() => {
                                    logout();
                                    showSuccessToast(
                                        t('settings.deleteAccount.accountDeleted'),
                                        t('settings.deleteAccount.accountDeletedDescription')
                                    );
                                })
                                .catch((error) => {
                                    showErrorToast(
                                        t('settings.deleteAccount.accountDeletionFailed'),
                                        t('settings.deleteAccount.accountDeletionFailedDescription')
                                    );
                                });
                        }
                    }
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-white px-4">
            <SettingsHeader />
            <SettingsCategory title={t('settings.titles.account')}>
                <SettingsMenuItem 
                    icon="exit-outline"
                    label={t('settings.titles.logout')}
                    onPress={handleLogout}
                    testID="logout"
                />

                <View className="h-px rounded-full w-1/2 bg-gray-300" />
                
                <SettingsMenuItem 
                    icon="document-text-outline"
                    label={t('auth.data-privacy.privacyPolicy')}
                    onPress={() => Linking.openURL('https://remyshift.github.io/KicksFolio/')}
                />

                <View className="h-px rounded-full w-1/2 bg-gray-300" />

                <SettingsMenuItem 
                    icon="person-outline"
                    label={t('settings.titles.editProfile')}
                    onPress={() => router.push('/edit-profile')}
                    testID="edit-profile"
                />

                <View className="h-px rounded-full w-1/2 bg-gray-300" />

                <SettingsMenuItem 
                    icon="trash-outline"
                    label={t('settings.titles.deleteAccount')}
                    onPress={handleDeleteAccount}
                    color="#dc2626"
                    textColor="#dc2626"
                    testID="delete-account"
                />
            </SettingsCategory>
        </View>
    );
} 