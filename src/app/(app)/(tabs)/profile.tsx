import { useState } from 'react';

import ProfileDisplayContainer from '@/components/screens/app/profile/ProfileDisplayContainer';
import { useSession } from '@/contexts/authContext';
import { useModalStore } from '@/store/useModalStore';
import { Sneaker } from '@/types/sneaker';

export default function Profile() {
	const { user, userSneakers, refreshUserData } = useSession();

	console.log('🔍 Profile.tsx - État de la session:', {
		user,
		userSneakers,
		userSneakersLength: userSneakers?.length,
		userIsNull: user === null,
		userIsUndefined: user === undefined,
		userSneakersIsNull: userSneakers === null,
		userSneakersIsUndefined: userSneakers === undefined,
	});
	const { setModalStep, setIsVisible, setCurrentSneaker } = useModalStore();
	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = async () => {
		setRefreshing(true);
		if (user) {
			await refreshUserData();
		}
		setRefreshing(false);
	};

	const handleAddSneaker = () => {
		setModalStep('index');
		setIsVisible(true);
	};

	const handleSneakerPress = (sneaker: Sneaker) => {
		setCurrentSneaker(sneaker);
		setModalStep('view');
		setIsVisible(true);
	};

	if (!user) {
		return null;
	}

	return (
		<ProfileDisplayContainer
			user={user}
			userSneakers={userSneakers || []}
			refreshing={refreshing}
			onRefresh={onRefresh}
			onSneakerPress={handleSneakerPress}
			onAddSneaker={handleAddSneaker}
			showBackButton={false}
		/>
	);
}
