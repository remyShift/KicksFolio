import { useEffect, useState } from 'react';

import WishlistContainer from '@/components/screens/app/wishlist/WishlistContainer';
import { useSession } from '@/contexts/authContext';

export default function Wishlist() {
	const [refreshing, setRefreshing] = useState(false);
	const { refreshUserData, wishlistSneakers, user } = useSession();

	useEffect(() => {
		if (user && wishlistSneakers === null) {
			refreshUserData();
		}
	}, [user, refreshUserData]);

	const onRefresh = async () => {
		setRefreshing(true);
		try {
			await refreshUserData();
		} catch (error) {
			console.error('Error refreshing wishlist:', error);
		} finally {
			setRefreshing(false);
		}
	};

	return <WishlistContainer refreshing={refreshing} onRefresh={onRefresh} />;
}
