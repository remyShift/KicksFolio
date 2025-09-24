import { useEffect, useState } from 'react';

import { View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import SneakersModalWrapper from '@/components/screens/app/SneakersModalWrapper';
import SharedCollectionError from '@/components/screens/share-collection/SharedCollectionError';
import { useSharedCollectionFilters } from '@/components/screens/share-collection/SharedCollectionFilters';
import { SharedCollectionForAnonymous } from '@/components/screens/share-collection/SharedCollectionForAnonymous';
import SharedCollectionLoader from '@/components/screens/share-collection/SharedCollectionLoader';
import { useModalNavigation } from '@/components/ui/modals/SneakersModal/hooks/useModalNavigation';
import { useSession } from '@/contexts/authContext';
import { shareHandler } from '@/d/Share';
import { useAnonymousAuth } from '@/hooks/auth/useAnonymousAuth';
import { SharedCollectionData } from '@/types/sharing';

export default function SharedCollectionScreen() {
	const { shareToken } = useLocalSearchParams<{ shareToken: string }>();

	const [collectionData, setCollectionData] =
		useState<SharedCollectionData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const { ensureAnonymousAuth } = useAnonymousAuth();
	const { user: currentUser } = useSession();

	const { filteredSneakers, contextSneakers } = useSharedCollectionFilters({
		collectionData,
	});

	useModalNavigation({ contextSneakers });

	useEffect(() => {
		if (currentUser && !currentUser.is_anonymous) {
			if (shareToken && shareToken !== 'undefined') {
				router.replace(
					`/(app)/(tabs)/search/shared-collection/${shareToken}`
				);
			} else {
				console.warn(
					'📍 ShareCollection: No valid shareToken for authenticated user, redirecting to home'
				);
				router.replace('/(app)/(tabs)');
			}
			return;
		}

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
				if (err instanceof Error && err.message.includes('not found')) {
					console.warn('Shared collection not found:', shareToken);
					setError('Collection not found or expired');
				} else {
					console.error('Failed to load shared collection:', err);
					setError('Failed to load collection');
				}
			} finally {
				setLoading(false);
			}
		}

		loadSharedCollection();
	}, [shareToken, ensureAnonymousAuth, currentUser]);

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

	if (currentUser && !currentUser.is_anonymous) {
		return null;
	}

	if (loading) {
		return <SharedCollectionLoader />;
	}

	if (error || !collectionData) {
		return (
			<SharedCollectionError
				error={error || undefined}
				isAuthenticated={false}
			/>
		);
	}

	return (
		<View className="flex-1 bg-background">
			<SharedCollectionForAnonymous
				collectionData={collectionData}
				loading={loading}
				onRefresh={handleRefresh}
				filteredSneakers={filteredSneakers}
			/>
			<SneakersModalWrapper />
		</View>
	);
}
