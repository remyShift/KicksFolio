import { useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import ProfileDisplayContainer from '@/components/screens/app/profile/ProfileDisplayContainer';
import { useModalNavigation } from '@/components/ui/modals/SneakersModal/hooks/useModalNavigation';
import { shareHandler } from '@/d/Share';
import { useAnonymousAuth } from '@/hooks/useAnonymousAuth';
import { SharedCollectionData } from '@/types/sharing';

export default function SharedCollectionScreen() {
	const { shareToken } = useLocalSearchParams<{ shareToken: string }>();
	const { t } = useTranslation();
	const [collectionData, setCollectionData] =
		useState<SharedCollectionData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const { ensureAnonymousAuth } = useAnonymousAuth();

	const contextSneakers = useMemo(() => {
		return collectionData?.sneakers_data || [];
	}, [collectionData?.sneakers_data]);

	useModalNavigation({ contextSneakers });

	useEffect(() => {
		async function loadSharedCollection() {
			if (!shareToken) {
				setError('Invalid share link');
				setLoading(false);
				return;
			}

			try {
				await ensureAnonymousAuth();
				const data = await shareHandler.getSharedCollection(shareToken);
				setCollectionData(data);
			} catch (err) {
				console.error('Failed to load shared collection:', err);
				setError('Failed to load collection');
			} finally {
				setLoading(false);
			}
		}

		loadSharedCollection();
	}, [shareToken, ensureAnonymousAuth]);

	if (loading) {
		return (
			<View className="flex-1 bg-background pt-32 items-center justify-center">
				<ActivityIndicator size="large" color="black" />
				<Text className="font-open-sans text-gray-500 mt-4">
					{t('shared.loading')}
				</Text>
			</View>
		);
	}

	if (error || !collectionData) {
		return (
			<View className="flex-1 bg-background pt-32 items-center justify-center">
				<Text className="font-open-sans text-gray-500 text-center">
					{error || t('shared.error.notFound')}
				</Text>
			</View>
		);
	}

	const handleRefresh = async () => {
		if (shareToken) {
			try {
				const data = await shareHandler.getSharedCollection(shareToken);
				setCollectionData(data);
			} catch (err) {
				console.error('Failed to refresh shared collection:', err);
			}
		}
	};

	return (
		<ProfileDisplayContainer
			user={collectionData.user_data}
			userSneakers={collectionData.sneakers_data}
			refreshing={loading}
			onRefresh={handleRefresh}
			showBackButton={false}
		/>
	);
}
