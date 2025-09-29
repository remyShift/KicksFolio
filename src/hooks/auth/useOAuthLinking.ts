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
			console.log(
				'🔗 Starting Google account linking for user:',
				user.id
			);

			const { data: currentSession } = await supabase.auth.getSession();

			const result = await auth.signInWithGoogle();
			console.log('✅ Google OAuth successful, linking account:', {
				userId: user.id,
				oauthUserId: result.user.id,
			});

			await authProxy.linkOAuthAccount(user.id, 'google', result.user.id);
			console.log('✅ Google account successfully linked');

			showSuccessToast(
				t('settings.oauth.googleLinked'),
				t('settings.oauth.googleLinkedDescription')
			);

			setIsGoogleLinked(true);

			// Skip session restoration completely - it causes infinite blocking
			console.log('🔄 Skipping session restoration (causes blocking)');
			console.log(
				'ℹ️ OAuth linking completed, user now authenticated with Google session'
			);

			// The user is now authenticated with the OAuth session
			// The auth context will handle user data loading automatically

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
										provider_account_id: result.user.id,
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

		// Check if this is the user's only authentication method
		console.log('🔍 Checking if Google is the only auth method...');

		try {
			const linkedAccounts = await authProxy.getLinkedOAuthAccounts(
				user.id
			);

			// Check if user has password authentication
			const hasPasswordAuth = await authProxy.hasPasswordAuth();
			const hasOtherOAuth = linkedAccounts.some(
				(account) => account.provider !== 'google'
			);

			console.log('🔍 Auth methods check:', {
				hasPasswordAuth,
				hasOtherOAuth,
				totalOAuthAccounts: linkedAccounts.length,
				canUnlinkGoogle: hasPasswordAuth || hasOtherOAuth,
			});

			// Check if Google is the only authentication method
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
			// Continue with unlinking if check fails (fallback to old behavior)
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
							console.log(
								'🔓 Unlinking Google account for user:',
								user.id
							);
							await authProxy.unlinkOAuthAccount(
								user.id,
								'google'
							);
							console.log(
								'✅ Google account successfully unlinked'
							);

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
			console.log('🍎 Starting Apple account linking for user:', user.id);

			const { data: currentSession } = await supabase.auth.getSession();
			console.log('💾 Current session saved:', !!currentSession?.session);

			const result = await auth.signInWithApple();
			console.log('✅ Apple OAuth successful, linking account:', {
				userId: user.id,
				oauthUserId: result.user.id,
			});

			console.log('🔗 Calling authProxy.linkOAuthAccount...');
			await authProxy.linkOAuthAccount(user.id, 'apple', result.user.id);
			console.log('✅ Apple account successfully linked');

			console.log('🎉 Showing success toast immediately...');
			showSuccessToast(
				t('settings.oauth.appleLinked'),
				t('settings.oauth.appleLinkedDescription')
			);

			console.log('🔄 Forcing immediate state update...');
			setIsAppleLinked(true);

			// Skip session restoration completely - it causes infinite blocking
			console.log('🔄 Skipping session restoration (causes blocking)');
			console.log(
				'ℹ️ OAuth linking completed, user now authenticated with Apple session'
			);

			// The user is now authenticated with the OAuth session
			// The auth context will handle user data loading automatically

			console.log('🔄 Refreshing linked accounts status...');
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
										provider_account_id: result.user.id,
									},
								],
							}
						: null
				);
				console.log('✅ Linked accounts status refreshed');
			}, 500);

			console.log('✅ Apple linking process completed successfully');
		} catch (error) {
			console.error('❌ Error linking Apple account:', error);
			console.error('❌ Error details:', JSON.stringify(error, null, 2));
			showErrorToast(
				t('settings.oauth.linkingFailed'),
				t('settings.oauth.linkingFailedDescription')
			);
		} finally {
			console.log('🔄 Setting loading state to false');
			setIsAppleLoading(false);
		}
	};

	const unlinkAppleAccount = async () => {
		if (!user) return;

		// Check if this is the user's only authentication method
		console.log('🔍 Checking if Apple is the only auth method...');

		try {
			const linkedAccounts = await authProxy.getLinkedOAuthAccounts(
				user.id
			);

			// Check if user has password authentication
			const hasPasswordAuth = await authProxy.hasPasswordAuth();
			const hasOtherOAuth = linkedAccounts.some(
				(account) => account.provider !== 'apple'
			);

			console.log('🔍 Auth methods check:', {
				hasPasswordAuth,
				hasOtherOAuth,
				totalOAuthAccounts: linkedAccounts.length,
				canUnlinkApple: hasPasswordAuth || hasOtherOAuth,
			});

			// Check if Apple is the only authentication method
			if (!hasPasswordAuth && !hasOtherOAuth) {
				console.log(
					"⚠️ Cannot unlink Apple - it's the only auth method"
				);
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
			// Continue with unlinking if check fails (fallback to old behavior)
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
						console.log(
							'🔓 Starting Apple account unlinking process...'
						);
						console.log('👤 Current user data:', {
							userId: user.id,
							email: user.email,
						});
						console.log(
							'📱 Current Apple link status before unlinking:',
							isAppleLinked
						);

						try {
							console.log(
								'🔓 Calling authProxy.unlinkOAuthAccount...'
							);
							await authProxy.unlinkOAuthAccount(
								user.id,
								'apple'
							);
							console.log(
								'✅ AuthProxy unlinking completed successfully'
							);

							console.log(
								'🔄 Setting Apple linked state to false immediately'
							);
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

							console.log(
								'⏱️ Scheduling linked accounts check in 100ms'
							);
							setTimeout(async () => {
								console.log(
									'🔍 Re-checking linked accounts from database...'
								);
								await checkLinkedAccounts();
							}, 100);

							showSuccessToast(
								t('settings.oauth.appleUnlinked'),
								t('settings.oauth.appleUnlinkedDescription')
							);
							console.log('✅ Apple unlinking UI flow completed');
						} catch (error) {
							console.error(
								'❌ Error unlinking Apple account:',
								error
							);
							console.error(
								'❌ Error details:',
								JSON.stringify(error, null, 2)
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
