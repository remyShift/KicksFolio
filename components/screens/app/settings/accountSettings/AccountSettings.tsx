import { router } from 'expo-router'
import SettingsCategory from '../SettingsCategory'
import SettingsMenuItem from '../SettingsMenuItem'
import { useTranslation } from 'react-i18next'
import { Alert, Linking, View } from 'react-native'
import { useAuth } from '@/hooks/useAuth'
import useToast from '@/hooks/useToast'
import { useSession } from '@/context/authContext'

export default function AccountSettings() {
    const { t } = useTranslation()
    const { user } = useSession();
    const { showSuccessToast, showErrorToast } = useToast();
    const { logout, deleteAccount } = useAuth();

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
        <SettingsCategory title={t('settings.titles.account')}>            
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
                icon="exit-outline"
                label={t('settings.titles.logout')}
                onPress={handleLogout}
                testID="logout"
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
    )
}
