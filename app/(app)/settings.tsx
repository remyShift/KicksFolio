import { Alert, View } from 'react-native';
import SettingsHeader from '@/components/screens/app/settings/SettingsHeader';
import AccountSettings from '@/components/screens/app/settings/accountSettings/AccountSettings';
import AppSettings from '@/components/screens/app/settings/appSettings/AppSettings';
import SettingsMenuItem from '@/components/screens/app/settings/shared/SettingsMenuItem';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/context/authContext';
import useToast from '@/hooks/ui/useToast';
import { useAuth } from '@/hooks/useAuth';

export default function Settings() {
    const { t } = useTranslation();
    const { user } = useSession();
    const { showSuccessToast, showErrorToast } = useToast();
    const { logout, deleteAccount } = useAuth();

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
        <View className="flex-1 bg-white px-4" testID="settings-container">
            <SettingsHeader />
            <View className="flex-1 gap-10" testID="settings-content">
                <AccountSettings />
                <AppSettings />
                <SettingsMenuItem 
                    icon="trash-outline"
                    label={t('settings.titles.deleteAccount')}
                    onPress={handleDeleteAccount}
                    color="#dc2626"
                    textColor="#dc2626"
                    testID="delete-account"
                />
            </View>
        </View>
    );
} 