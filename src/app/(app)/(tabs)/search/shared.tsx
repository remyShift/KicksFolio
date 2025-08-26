import { useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';

import { router, useSegments } from 'expo-router';

import ProfileDisplayContainer from '@/components/screens/app/profile/ProfileDisplayContainer';
import { useModalNavigation } from '@/components/ui/modals/SneakersModal/hooks/useModalNavigation';
import { useSession } from '@/contexts/authContext';
import { shareHandler } from '@/d/Share';
import { useAnonymousAuth } from '@/hooks/useAnonymousAuth';
import { SharedCollectionData } from '@/types/sharing';

export default function SharedCollectionScreen() {
	const segments = useSegments();
	const shareToken = segments[segments.length - 1];
	const { t } = useTranslation();
	const [collectionData, setCollectionData] =
		useState<SharedCollectionData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const { ensureAnonymousAuth } = useAnonymousAuth();
	const { user: currentUser } = useSession();

	const isAuthenticated = useMemo(() => {
		return !!currentUser;
	}, [currentUser]);

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

	if (isAuthenticated) {
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

	return (
		<SharedCollectionForAnonymous
			collectionData={collectionData}
			loading={loading}
			onRefresh={handleRefresh}
		/>
	);
}

function SharedCollectionForAnonymous({
	collectionData,
	loading,
	onRefresh,
}: {
	collectionData: SharedCollectionData;
	loading: boolean;
	onRefresh: () => Promise<void>;
}) {
	const { t } = useTranslation();

	const filteredSneakers = useMemo(() => {
		const filters = collectionData.filters;

		if (
			!filters ||
			(!filters.brands?.length &&
				!filters.sizes?.length &&
				!filters.conditions?.length &&
				!filters.statuses?.length)
		) {
			return collectionData.sneakers_data;
		}

		return collectionData.sneakers_data.filter((sneaker) => {
			let matches = true;

			if (filters.brands?.length > 0) {
				matches =
					matches &&
					filters.brands.includes(sneaker.brand?.name || '');
			}

			if (filters.sizes?.length > 0) {
				const sizeEU = sneaker.size_eu?.toString();
				const sizeUS = sneaker.size_us?.toString();
				matches =
					matches &&
					(filters.sizes.includes(sizeEU) ||
						filters.sizes.includes(sizeUS));
			}

			if (filters.conditions?.length > 0) {
				matches =
					matches &&
					filters.conditions.includes(sneaker.condition?.toString());
			}

			if (filters.statuses?.length > 0) {
				matches =
					matches && filters.statuses.includes(sneaker.status_id);
			}

			return matches;
		});
	}, [collectionData.sneakers_data, collectionData.filters]);

	return (
		<>
			<AnonymousUserMessage />

			<ProfileDisplayContainer
				user={collectionData.user_data}
				userSneakers={filteredSneakers}
				refreshing={loading}
				onRefresh={onRefresh}
				showBackButton={false}
				isAnonymousUser={true}
			/>
		</>
	);
}

function AnonymousUserMessage() {
	const { t } = useTranslation();

	const handleLoginPress = () => {
		router.push('/(auth)/login');
	};

	return (
		<View className="bg-primary/10 p-4 mx-4 mt-4 rounded-lg">
			<Text className="font-open-sans text-sm text-primary text-center mb-2">
				{t('shared.connectToAccess')}
			</Text>
			<Text
				className="font-open-sans-bold text-sm text-primary text-center underline"
				onPress={handleLoginPress}
			>
				{t('shared.connectNow')}
			</Text>
		</View>
	);
}
