import { useState } from 'react';

import ProfileDisplayContainer from '@/components/screens/app/profile/ProfileDisplayContainer';
import { useSession } from '@/contexts/authContext';

export default function Profile() {
	const { user, userSneakers, refreshUserData } = useSession();
	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = async () => {
		setRefreshing(true);
		if (user) {
			await refreshUserData();
		}
		setRefreshing(false);
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
			showBackButton={false}
		/>
	);
}
