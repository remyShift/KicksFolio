import { memo } from 'react';

import SwipeableWrapper from '@/components/ui/swipe/SwipeableWrapper';
import { useSession } from '@/contexts/authContext';
import { Sneaker } from '@/types/sneaker';

import SneakerListItem from './SneakerListItem';
import SwipeActions from './SwipeActions';

interface ProfileSwipeableWrapperProps {
	item: Sneaker;
	showOwnerInfo?: boolean;
	userSneakers?: Sneaker[];
	onCloseRow?: () => void;
}

function ProfileSwipeableWrapper({
	item,
	showOwnerInfo = false,
	userSneakers,
	onCloseRow,
}: ProfileSwipeableWrapperProps) {
	const { user: currentUser } = useSession();

	// Logique d'ownership pour le profil
	const getIsOwner = (sneaker: Sneaker) => {
		return currentUser?.id === sneaker.user_id;
	};

	return (
		<SwipeableWrapper
			item={item}
			showOwnerInfo={showOwnerInfo}
			userSneakers={userSneakers}
			onCloseRow={onCloseRow}
			customSwipeActions={SwipeActions}
			customMainContent={SneakerListItem}
			getIsOwner={getIsOwner}
		/>
	);
}

export default memo(ProfileSwipeableWrapper);
