import { memo } from 'react';

import SwipeableWrapper from '@/components/ui/swipe/SwipeableWrapper';
import { Sneaker } from '@/types/sneaker';

import WishlistListItem from './WishlistListItem';
import WishlistSwipeActions from './WishlistSwipeActions';

interface WishlistSwipeableItemProps {
	sneaker: Sneaker;
	wishlistSneakers?: Sneaker[];
}

function WishlistSwipeableItem({
	sneaker,
	wishlistSneakers,
}: WishlistSwipeableItemProps) {
	const getIsOwner = () => {
		return false;
	};

	return (
		<SwipeableWrapper
			item={sneaker}
			showOwnerInfo={false}
			userSneakers={wishlistSneakers}
			customSwipeActions={WishlistSwipeActions}
			customMainContent={WishlistListItem}
			getIsOwner={getIsOwner}
		/>
	);
}

export default memo(WishlistSwipeableItem);
