import { memo } from 'react';

import { Sneaker } from '@/types/sneaker';

import WishlistListItem from './WishlistListItem';

interface WishlistSwipeItemListProps {
	item: Sneaker;
	showOwnerInfo?: boolean;
}

function WishlistSwipeItemList({
	item,
	showOwnerInfo = false,
}: WishlistSwipeItemListProps) {
	return <WishlistListItem sneaker={item} showOwnerInfo={showOwnerInfo} />;
}

export default memo(WishlistSwipeItemList);
