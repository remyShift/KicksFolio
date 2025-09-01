import { useCallback, useMemo } from 'react';

import { RefreshControl, ScrollView } from 'react-native';

import { useModalContext } from '@/components/ui/modals/SneakersModal/hooks/useModalContext';
import { useSession } from '@/contexts/authContext';
import { Sneaker } from '@/types/sneaker';

import EmptyWishlistState from './EmptyWishlistState';
import WishlistHeader from './WishlistHeader';
import WishlistSneakerList from './WishlistSneakerList';

interface WishlistContainerProps {
	refreshing: boolean;
	onRefresh: () => Promise<void>;
}

export default function WishlistContainer({
	refreshing,
	onRefresh,
}: WishlistContainerProps) {
	const { wishlistSneakers } = useSession();

	const validatedSneakers = useMemo(() => {
		if (wishlistSneakers === null) {
			return [];
		}

		return wishlistSneakers && Array.isArray(wishlistSneakers)
			? wishlistSneakers
			: [];
	}, [wishlistSneakers]);

	const { openSneakerModal } = useModalContext({
		contextSneakers: validatedSneakers,
	});

	const handleSneakerPress = useCallback(
		(sneaker: Sneaker) => {
			openSneakerModal(sneaker);
		},
		[openSneakerModal]
	);

	if (!validatedSneakers.length) {
		return (
			<ScrollView
				className="flex-1"
				testID="wishlist-scroll-view"
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor="#FF6B6B"
						progressViewOffset={60}
					/>
				}
			>
				<WishlistHeader wishlistSneakers={[]} />
				<EmptyWishlistState />
			</ScrollView>
		);
	}

	return (
		<ScrollView
			className="flex-1"
			testID="wishlist-scroll-view"
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={onRefresh}
					tintColor="#FF6B6B"
					progressViewOffset={60}
				/>
			}
		>
			<WishlistHeader wishlistSneakers={validatedSneakers} />
			<WishlistSneakerList
				sneakers={validatedSneakers}
				onSneakerPress={handleSneakerPress}
				refreshing={refreshing}
				onRefresh={onRefresh}
			/>
		</ScrollView>
	);
}
