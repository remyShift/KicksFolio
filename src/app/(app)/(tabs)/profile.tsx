import { useState } from 'react';

import ProfileDisplayContainer from '@/components/screens/app/profile/ProfileDisplayContainer';
import { useSession } from '@/contexts/authContext';
import { useModalContext } from '@/hooks/useModalContext';
import { Sneaker } from '@/types/sneaker';

export default function Profile() {
	const { user, userSneakers, refreshUserData } = useSession();
	const { openSneakerModal } = useModalContext();
	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = async () => {
		setRefreshing(true);
		if (user) {
			await refreshUserData();
		}
		setRefreshing(false);
	};

	const handleSneakerPress = (sneaker: Sneaker) => {
		openSneakerModal(sneaker);
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
			showBackButton={false}
		/>
	);
}
