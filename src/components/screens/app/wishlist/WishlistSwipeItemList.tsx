import { memo } from 'react';

import SwipeableWrapper from '@/components/ui/swipe/SwipeableWrapper';
import { useSession } from '@/contexts/authContext';
import { Sneaker } from '@/types/sneaker';

import SneakerListItem from '../profile/displayState/list/SneakerListItem';
import WishlistSwipeActions from './WishlistSwipeActions';

interface WishlistSwipeItemListProps {
	item: Sneaker;
	showOwnerInfo?: boolean;
	onCloseRow?: () => void;
}

function WishlistSwipeItemList({
	item,
	showOwnerInfo = false,
	onCloseRow,
}: WishlistSwipeItemListProps) {
	const { user: currentUser } = useSession();

	// Logique d'ownership pour la wishlist
	const getIsOwner = (sneaker: Sneaker) => {
		// Dans la wishlist, l'utilisateur est toujours propriétaire de ses items
		return currentUser?.id === sneaker.user_id;
	};

	return (
		<SwipeableWrapper
			item={item}
			showOwnerInfo={showOwnerInfo}
			onCloseRow={onCloseRow}
			customSwipeActions={WishlistSwipeActions}
			customMainContent={SneakerListItem}
			getIsOwner={getIsOwner}
		/>
	);
}

export default memo(WishlistSwipeItemList);
