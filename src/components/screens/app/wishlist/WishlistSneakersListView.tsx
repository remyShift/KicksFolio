import { memo } from 'react';

import { Sneaker } from '@/types/sneaker';

import WishlistSneakerListFactory from './WishlistSneakerListFactory';

interface WishlistSneakersListViewProps {
	sneakers: Sneaker[];
	onSneakerPress: (sneaker: Sneaker) => void;
	showOwnerInfo?: boolean;
}

function WishlistSneakersListView({
	sneakers,
	onSneakerPress,
	showOwnerInfo = false,
}: WishlistSneakersListViewProps) {
	return (
		<WishlistSneakerListFactory
			sneakers={sneakers}
			showOwnerInfo={showOwnerInfo}
		/>
	);
}

export default memo(WishlistSneakersListView, (prevProps, nextProps) => {
	return (
		prevProps.sneakers === nextProps.sneakers &&
		prevProps.showOwnerInfo === nextProps.showOwnerInfo
	);
});
