import { useEffect, useState } from 'react';

import { useLocalSearchParams } from 'expo-router';

import ProfileDisplayContainer from '@/components/screens/app/profile/ProfileDisplayContainer';
import SharedCollectionError from '@/components/screens/share-collection/SharedCollectionError';
import { useSharedCollectionFilters } from '@/components/screens/share-collection/SharedCollectionFilters';
import SharedCollectionLoader from '@/components/screens/share-collection/SharedCollectionLoader';
import { useModalNavigation } from '@/components/ui/modals/SneakersModal/hooks/useModalNavigation';
import { shareHandler } from '@/d/Share';
import { SharedCollectionData } from '@/types/sharing';

export default function SharedCollectionScreen() {
	const { shareToken } = useLocalSearchParams<{ shareToken: string }>();
	const [collectionData, setCollectionData] =
		useState<SharedCollectionData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const { filteredSneakers, contextSneakers } = useSharedCollectionFilters({
		collectionData,
	});

	useModalNavigation({ contextSneakers });

	useEffect(() => {
		async function loadSharedCollection() {
			if (!shareToken) {
				setError('Invalid share link');
				setLoading(false);
				return;
			}

			try {
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
	}, [shareToken]);

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

	if (loading) {
		return <SharedCollectionLoader />;
	}

	if (error || !collectionData) {
		return (
			<SharedCollectionError
				error={error || undefined}
				isAuthenticated={true}
			/>
		);
	}

	return (
		<ProfileDisplayContainer
			user={collectionData.user_data}
			userSneakers={filteredSneakers}
			refreshing={loading}
			onRefresh={handleRefresh}
			showBackButton={true}
			showSettingsButton={false}
			isSharedCollection={true}
		/>
	);
}
