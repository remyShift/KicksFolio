import { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import ProfileDisplayContainer from '@/components/screens/app/profile/ProfileDisplayContainer';
import { useModalNavigation } from '@/components/ui/modals/SneakersModal/hooks/useModalNavigation';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function UserProfileScreen() {
	const { userId } = useLocalSearchParams<{ userId: string }>();
	const { t } = useTranslation();
	const [refreshing, setRefreshing] = useState(false);

	const { userProfile, isLoading, refreshUserProfile } =
		useUserProfile(userId);

	const contextSneakers = useMemo(() => {
		return userProfile?.sneakers || [];
	}, [userProfile?.sneakers]);

	useModalNavigation({ contextSneakers });

	if (isLoading) {
		return (
			<View className="flex-1 bg-background pt-32 items-center justify-center">
				<Text className="font-open-sans text-gray-500">
					{t('ui.loading')}
				</Text>
			</View>
		);
	}

	if (!userProfile) {
		return (
			<View className="flex-1 bg-background pt-32 items-center justify-center">
				<Text className="font-open-sans text-gray-500">
					{t('userProfile.error.notFound')}
				</Text>
			</View>
		);
	}

	const onRefresh = async () => {
		setRefreshing(true);
		if (userProfile) {
			await refreshUserProfile();
		}
		setRefreshing(false);
	};

	const { userSearch, sneakers } = userProfile;

	return (
		<ProfileDisplayContainer
			user={userSearch}
			userSneakers={sneakers || []}
			refreshing={refreshing}
			onRefresh={onRefresh}
			showBackButton={true}
		/>
	);
}
