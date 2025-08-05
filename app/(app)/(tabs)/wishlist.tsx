import { useState } from 'react';

import { RefreshControl, ScrollView, View } from 'react-native';

import EmptyWishlistState from '@/components/screens/app/wishlist/EmptyWishlistState';
import WishlistDualViewContainer from '@/components/screens/app/wishlist/WishlistDualViewContainer';
import WishlistHeader from '@/components/screens/app/wishlist/WishlistHeader';
import { useSession } from '@/context/authContext';
import { useModalStore } from '@/store/useModalStore';
import { Sneaker } from '@/types/sneaker';

export default function Wishlist() {
	const { wishlistSneakers, refreshUserData } = useSession();
	const { setModalStep, setIsVisible, setCurrentSneaker } = useModalStore();
	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = async () => {
		setRefreshing(true);
		await refreshUserData();
		setRefreshing(false);
	};

	const handleSneakerPress = (sneaker: Sneaker) => {
		setCurrentSneaker(sneaker);
		setModalStep('view');
		setIsVisible(true);
	};

	if (!wishlistSneakers || wishlistSneakers.length === 0) {
		return (
			<ScrollView
				className="flex-1"
				testID="wishlist-scroll-view"
				scrollEnabled={true}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor="#FF6B6B"
						progressViewOffset={60}
						testID="refresh-control"
					/>
				}
			>
				<WishlistHeader wishlistSneakers={[]} />
				<View testID="empty-wishlist-container">
					<EmptyWishlistState />
				</View>
			</ScrollView>
		);
	}

	return (
		<ScrollView
			className="flex-1"
			testID="wishlist-scroll-view"
			scrollEnabled={true}
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={onRefresh}
					tintColor="#FF6B6B"
					progressViewOffset={60}
					testID="refresh-control"
				/>
			}
		>
			<WishlistHeader wishlistSneakers={wishlistSneakers} />
			<WishlistDualViewContainer
				wishlistSneakers={wishlistSneakers}
				onSneakerPress={handleSneakerPress}
			/>
		</ScrollView>
	);
}
