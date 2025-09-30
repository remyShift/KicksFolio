import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { supabase } from '@/config/supabase/supabase';
import { useSession } from '@/contexts/authContext';
import { Auth } from '@/domain/Auth';
import useToast from '@/hooks/ui/useToast';
import { authProxy } from '@/tech/proxy/AuthProxy';

export const useOAuthLinking = () => {
	const [isGoogleLinked, setIsGoogleLinked] = useState(false);
	const [isAppleLinked, setIsAppleLinked] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
	const [isAppleLoading, setIsAppleLoading] = useState(false);
	const { user, setUser } = useSession();
	const { showSuccessToast, showErrorToast } = useToast();
	const { t } = useTranslation();

	const auth = new Auth(authProxy);

	useEffect(() => {
		if (user) {
			checkLinkedAccounts();
		}
	}, [user]);

	const checkLinkedAccounts = async () => {
		if (!user) return;

		if (user.linked_oauth_accounts) {
			const googleLinked = user.linked_oauth_accounts.some(
				(account) => account.provider === 'google'
			);
			const appleLinked = user.linked_oauth_accounts.some(
				(account) => account.provider === 'apple'
			);

			setIsGoogleLinked(googleLinked);
			setIsAppleLinked(appleLinked);
			return;
		}

		try {
			const linkedAccounts = await authProxy.getLinkedOAuthAccounts(
				user.id
			);

			const googleLinked = linkedAccounts.some(
				(account) => account.provider === 'google'
			);
			const appleLinked = linkedAccounts.some(
				(account) => account.provider === 'apple'
			);

			setIsGoogleLinked(googleLinked);
			setIsAppleLinked(appleLinked);
		} catch (error) {
			console.error('Error checking linked accounts:', error);
		}
	};

	const linkGoogleAccount = async () => {
		if (!user) return;

		setIsGoogleLoading(true);
		try {
			const googleProviderAccountId =
				await authProxy.getGoogleProviderAccountId();

			await authProxy.linkOAuthAccount(
				user.id,
				'google',
				googleProviderAccountId
			);

			showSuccessToast(
				t('settings.oauth.googleLinked'),
				t('settings.oauth.googleLinkedDescription')
			);

			setIsGoogleLinked(true);

			setTimeout(async () => {
				await checkLinkedAccounts();
				setUser((prevUser) =>
					prevUser
						? {
								...prevUser,
								linked_oauth_accounts: [
									...(prevUser.linked_oauth_accounts || []),
									{
										provider: 'google',
										provider_account_id:
											googleProviderAccountId,
									},
								],
							}
						: null
				);
			}, 500);
		} catch (error) {
			console.error('❌ Error linking Google account:', error);
			showErrorToast(
				t('settings.oauth.linkingFailed'),
				t('settings.oauth.linkingFailedDescription')
			);
		} finally {
			setIsGoogleLoading(false);
		}
	};

	const unlinkGoogleAccount = async () => {
		if (!user) return;

		try {
			const linkedAccounts = await authProxy.getLinkedOAuthAccounts(
				user.id
			);

			const hasPasswordAuth = await authProxy.hasPasswordAuth(user.id);
			const hasOtherOAuth = linkedAccounts.some(
				(account) => account.provider !== 'google'
			);

			if (!hasPasswordAuth && !hasOtherOAuth) {
				console.log(
					"⚠️ Cannot unlink Google - it's the only auth method"
				);
				Alert.alert(
					t('settings.oauth.cannotUnlinkTitle'),
					t('settings.oauth.cannotUnlinkGoogleMessage'),
					[
						{
							text: t('alert.choices.ok'),
							style: 'default',
						},
					]
				);
				return;
			}
		} catch (error) {
			console.error('❌ Error checking auth methods:', error);
		}

		Alert.alert(
			t('settings.oauth.unlinkConfirmTitle'),
			t('settings.oauth.unlinkGoogleConfirmMessage'),
			[
				{
					text: t('alert.choices.cancel'),
					style: 'cancel',
				},
				{
					text: t('settings.oauth.unlink'),
					style: 'destructive',
					onPress: async () => {
						setIsGoogleLoading(true);
						try {
							await authProxy.unlinkOAuthAccount(
								user.id,
								'google'
							);

							const {
								data: { user: authUser },
							} = await supabase.auth.getUser();
							const isOAuthUser =
								authUser?.app_metadata?.provider &&
								['google', 'apple'].includes(
									authUser.app_metadata.provider
								);

							if (isOAuthUser && authUser.id !== user.id) {
								await supabase.auth.signOut();
								return;
							}

							setIsGoogleLinked(false);

							setUser((prevUser) =>
								prevUser
									? {
											...prevUser,
											linked_oauth_accounts: (
												prevUser.linked_oauth_accounts ||
												[]
											).filter(
												(account) =>
													account.provider !==
													'google'
											),
										}
									: null
							);

							setTimeout(async () => {
								await checkLinkedAccounts();
							}, 100);

							showSuccessToast(
								t('settings.oauth.googleUnlinked'),
								t('settings.oauth.googleUnlinkedDescription')
							);
						} catch (error) {
							console.error(
								'❌ Error unlinking Google account:',
								error
							);
							showErrorToast(
								t('settings.oauth.unlinkingFailed'),
								t('settings.oauth.unlinkingFailedDescription')
							);
						} finally {
							setIsGoogleLoading(false);
						}
					},
				},
			]
		);
	};

	const linkAppleAccount = async () => {
		if (!user) return;

		setIsAppleLoading(true);
		try {
			const appleProviderAccountId =
				await authProxy.getAppleProviderAccountId();

			await authProxy.linkOAuthAccount(
				user.id,
				'apple',
				appleProviderAccountId
			);

			showSuccessToast(
				t('settings.oauth.appleLinked'),
				t('settings.oauth.appleLinkedDescription')
			);

			setIsAppleLinked(true);

			setTimeout(async () => {
				await checkLinkedAccounts();
				setUser((prevUser) =>
					prevUser
						? {
								...prevUser,
								linked_oauth_accounts: [
									...(prevUser.linked_oauth_accounts || []),
									{
										provider: 'apple',
										provider_account_id:
											appleProviderAccountId,
									},
								],
							}
						: null
				);
			}, 500);
		} catch (error) {
			console.error('❌ Error linking Apple account:', error);
			console.error('❌ Error details:', JSON.stringify(error, null, 2));
			showErrorToast(
				t('settings.oauth.linkingFailed'),
				t('settings.oauth.linkingFailedDescription')
			);
		} finally {
			setIsAppleLoading(false);
		}
	};

	const unlinkAppleAccount = async () => {
		if (!user) return;

		try {
			const linkedAccounts = await authProxy.getLinkedOAuthAccounts(
				user.id
			);

			const hasPasswordAuth = await authProxy.hasPasswordAuth(user.id);
			const hasOtherOAuth = linkedAccounts.some(
				(account) => account.provider !== 'apple'
			);

			if (!hasPasswordAuth && !hasOtherOAuth) {
				Alert.alert(
					t('settings.oauth.cannotUnlinkTitle'),
					t('settings.oauth.cannotUnlinkAppleMessage'),
					[
						{
							text: t('alert.choices.ok'),
							style: 'default',
						},
					]
				);
				return;
			}
		} catch (error) {
			console.error('❌ Error checking auth methods:', error);
		}

		Alert.alert(
			t('settings.oauth.unlinkConfirmTitle'),
			t('settings.oauth.unlinkAppleConfirmMessage'),
			[
				{
					text: t('alert.choices.cancel'),
					style: 'cancel',
				},
				{
					text: t('settings.oauth.unlink'),
					style: 'destructive',
					onPress: async () => {
						setIsAppleLoading(true);

						try {
							await authProxy.unlinkOAuthAccount(
								user.id,
								'apple'
							);

							const {
								data: { user: authUser },
							} = await supabase.auth.getUser();
							const isOAuthUser =
								authUser?.app_metadata?.provider &&
								['google', 'apple'].includes(
									authUser.app_metadata.provider
								);

							if (isOAuthUser && authUser.id !== user.id) {
								await supabase.auth.signOut();
								return;
							}

							setIsAppleLinked(false);

							setUser((prevUser) =>
								prevUser
									? {
											...prevUser,
											linked_oauth_accounts: (
												prevUser.linked_oauth_accounts ||
												[]
											).filter(
												(account) =>
													account.provider !== 'apple'
											),
										}
									: null
							);

							setTimeout(async () => {
								await checkLinkedAccounts();
							}, 100);

							showSuccessToast(
								t('settings.oauth.appleUnlinked'),
								t('settings.oauth.appleUnlinkedDescription')
							);
						} catch (error) {
							console.error(
								'❌ Error unlinking Apple account:',
								error
							);
							showErrorToast(
								t('settings.oauth.unlinkingFailed'),
								t('settings.oauth.unlinkingFailedDescription')
							);
						} finally {
							setIsAppleLoading(false);
						}
					},
				},
			]
		);
	};

	return {
		isGoogleLinked,
		isAppleLinked,
		linkGoogleAccount,
		unlinkGoogleAccount,
		linkAppleAccount,
		unlinkAppleAccount,
		isGoogleLoading,
		isAppleLoading,
	};
};
