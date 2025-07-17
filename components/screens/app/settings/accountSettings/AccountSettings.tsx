import { router } from 'expo-router'
import SettingsCategory from '../shared/SettingsCategory'
import SettingsMenuItem from '../shared/SettingsMenuItem'
import { useTranslation } from 'react-i18next'
import { Alert, Linking, View } from 'react-native'
import { useAuth } from '@/hooks/useAuth'
import useToast from '@/hooks/useToast'
import { useSession } from '@/context/authContext'
import Spacer from '../shared/Spacer'

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
                    text: t('alert.choices.cancel'),
                    style: 'cancel'
                },
                {
                    text: t('alert.choices.logout'),
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
                    text: t('alert.choices.cancel'),
                    style: 'cancel'
                },
                {
                    text: t('alert.choices.delete'),
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

            <Spacer />


            <SettingsMenuItem 
                icon="person-outline"
                label={t('settings.titles.editProfile')}
                onPress={() => router.push('/edit-profile')}
                testID="edit-profile"
            />

            <Spacer />

            <SettingsMenuItem 
                icon="share-social-outline"
                label={t('settings.titles.socialMedia')}
                onPress={() => router.push('/social-media')}
            />

            <Spacer />

            <SettingsMenuItem 
                icon="exit-outline"
                label={t('settings.titles.logout')}
                onPress={handleLogout}
                testID="logout"
            />

            <Spacer />

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
