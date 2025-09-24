import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, View } from 'react-native';

import AccountSettings from '@/components/screens/app/settings/accountSettings/AccountSettings';
import AppSettings from '@/components/screens/app/settings/appSettings/AppSettings';
import NotificationSettings from '@/components/screens/app/settings/notificationSettings/NotificationSettings';
import SettingsHeader from '@/components/screens/app/settings/SettingsHeader';
import SettingsMenuItem from '@/components/screens/app/settings/shared/SettingsMenuItem';
import { useSession } from '@/contexts/authContext';
import { useAuth } from '@/hooks/auth/useAuth';
import useToast from '@/hooks/ui/useToast';

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
					style: 'cancel',
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
										t(
											'settings.deleteAccount.accountDeleted'
										),
										t(
											'settings.deleteAccount.accountDeletedDescription'
										)
									);
								})
								.catch((error) => {
									showErrorToast(
										t(
											'settings.deleteAccount.accountDeletionFailed'
										),
										t(
											'settings.deleteAccount.accountDeletionFailedDescription'
										)
									);
								});
						}
					},
				},
			]
		);
	};

	return (
		<ScrollView
			className="flex-1 px-4 bg-white"
			contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
			showsVerticalScrollIndicator={false}
			testID="settings-container"
		>
			<View className="px-4">
				<SettingsHeader />
			</View>
			<View className="gap-4" testID="settings-content">
				<AccountSettings />
				<NotificationSettings />
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
		</ScrollView>
	);
}
