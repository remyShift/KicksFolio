import { memo } from 'react';

import SwipeableWrapper from '@/components/ui/swipe/SwipeableWrapper';
import { Sneaker } from '@/types/sneaker';

import WishlistListItem from './WishlistListItem';
import WishlistSwipeActions from './WishlistSwipeActions';

interface WishlistSwipeableItemProps {
	sneaker: Sneaker;
}

function WishlistSwipeableItem({ sneaker }: WishlistSwipeableItemProps) {
	const getIsOwner = () => {
		return false;
	};

	return (
		<SwipeableWrapper
			item={sneaker}
			showOwnerInfo={false}
			userSneakers={[sneaker]}
			customSwipeActions={WishlistSwipeActions}
			customMainContent={WishlistListItem}
			getIsOwner={getIsOwner}
		/>
	);
}

export default memo(WishlistSwipeableItem);
