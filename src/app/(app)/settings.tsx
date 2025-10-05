import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Text, View } from 'react-native';

import Constants from 'expo-constants';

import AccountSettings from '@/components/screens/app/settings/accountSettings/AccountSettings';
import AppSettings from '@/components/screens/app/settings/appSettings/AppSettings';
import NotificationSettings from '@/components/screens/app/settings/notificationSettings/NotificationSettings';
import SettingsHeader from '@/components/screens/app/settings/SettingsHeader';
import SettingsMenuItem from '@/components/screens/app/settings/shared/SettingsMenuItem';
import { ChangelogModal } from '@/components/ui/modals/ChangelogModal';
import { useSession } from '@/contexts/authContext';
import { useAuth } from '@/hooks/auth/useAuth';
import useToast from '@/hooks/ui/useToast';
import { useChangelog } from '@/hooks/useChangelog';

export default function Settings() {
	const { t } = useTranslation();
	const { user } = useSession();
	const { showSuccessToast, showErrorToast } = useToast();
	const { logout, deleteAccount } = useAuth();
	const {
		currentChangelog,
		isVisible,
		showChangelog,
		hideChangelog,
		appVersion,
	} = useChangelog();

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

			<View className="gap-3 mb-4">
				<SettingsMenuItem
					icon="sparkles"
					label="Nouveautés"
					onPress={showChangelog}
					color="#F27329"
					textColor="#F27329"
					testID="changelog-button"
				/>
			</View>

			<View className="gap-4" testID="settings-content">
				<AccountSettings />
				<NotificationSettings />
				<AppSettings />
			</View>

			<View className="gap-3 mt-6 mb-6">
				<SettingsMenuItem
					icon="log-out-outline"
					label={t('settings.titles.logout')}
					onPress={logout}
					color="#6b7280"
					textColor="#374151"
					testID="logout-button"
				/>
				<SettingsMenuItem
					icon="trash-outline"
					label={t('settings.titles.deleteAccount')}
					onPress={handleDeleteAccount}
					color="#dc2626"
					textColor="#dc2626"
					testID="delete-account"
				/>
			</View>

			<View className="items-center py-4 mt-auto">
				<Text className="text-gray-500 text-sm mb-2">
					{t('settings.version', {
						version: Constants.expoConfig?.version,
					})}
				</Text>
				<Text className="text-gray-400 text-xs">
					{t('settings.madeWithLove')}
				</Text>
			</View>

			{currentChangelog && (
				<ChangelogModal
					visible={isVisible}
					slides={currentChangelog.slides}
					onClose={hideChangelog}
					version={appVersion}
				/>
			)}
		</ScrollView>
	);
}
