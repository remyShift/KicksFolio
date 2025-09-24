import { User } from '@/types/user';

export const isProfileComplete = (user: User | any): boolean => {
	if (!user) return false;

	return !!(user.username && user.sneaker_size && user.sneaker_size > 0);
};

export const extractOAuthData = (user: any) => {
	const provider = user.app_metadata?.provider || 'email';
	let profilePicture = '';

	if (provider === 'apple') {
		const appleIdentity = user.identities?.find(
			(identity: any) => identity.provider === 'apple'
		);
		const identityData = appleIdentity?.identity_data;

		profilePicture =
			user.user_metadata?.avatar_url ||
			identityData?.picture ||
			user.user_metadata?.picture ||
			'';
	} else if (provider === 'google') {
		profilePicture =
			user.user_metadata?.picture || user.user_metadata?.avatar_url || '';
	}

	return {
		email: user.email || '',
		profile_picture: profilePicture,
		provider,
	};
};
