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
	const [isLoading, setIsLoading] = useState(false);
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

		try {
			console.log(
				'🔍 checkLinkedAccounts: Checking linked OAuth accounts for user:',
				user.id
			);
			console.log('📱 Current state before check:', {
				isGoogleLinked,
				isAppleLinked,
			});

			const linkedAccounts = await authProxy.getLinkedOAuthAccounts(
				user.id
			);
			console.log(
				'📋 checkLinkedAccounts: Found linked accounts:',
				linkedAccounts
			);
			console.log(
				'📊 checkLinkedAccounts: Account count:',
				linkedAccounts.length
			);

			const googleLinked = linkedAccounts.some(
				(account) => account.provider === 'google'
			);
			const appleLinked = linkedAccounts.some(
				(account) => account.provider === 'apple'
			);

			console.log('🔗 checkLinkedAccounts: Calculated link status:', {
				googleLinked,
				appleLinked,
			});
			console.log('📱 checkLinkedAccounts: Previous state:', {
				prevGoogleLinked: isGoogleLinked,
				prevAppleLinked: isAppleLinked,
			});

			console.log('🔄 checkLinkedAccounts: Updating state...');
			setIsGoogleLinked(googleLinked);
			setIsAppleLinked(appleLinked);
			console.log('✅ checkLinkedAccounts: State updated');
		} catch (error) {
			console.error(
				'❌ checkLinkedAccounts: Error checking linked accounts:',
				error
			);
		}
	};

	const linkGoogleAccount = async () => {
		if (!user) return;

		setIsLoading(true);
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

			if (currentSession?.session) {
				console.log('🔄 Restoring original session');
				await supabase.auth.setSession({
					access_token: currentSession.session.access_token,
					refresh_token: currentSession.session.refresh_token,
				});
			}

			setTimeout(async () => {
				await checkLinkedAccounts();
			}, 500);
		} catch (error) {
			console.error('❌ Error linking Google account:', error);
			showErrorToast(
				t('settings.oauth.linkingFailed'),
				t('settings.oauth.linkingFailedDescription')
			);
		} finally {
			setIsLoading(false);
		}
	};

	const unlinkGoogleAccount = async () => {
		if (!user) return;

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
						setIsLoading(true);
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
							setIsLoading(false);
						}
					},
				},
			]
		);
	};

	const linkAppleAccount = async () => {
		if (!user) return;

		setIsLoading(true);
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

			if (currentSession?.session) {
				console.log('🔄 Restoring original session...');
				await supabase.auth.setSession({
					access_token: currentSession.session.access_token,
					refresh_token: currentSession.session.refresh_token,
				});
				console.log('✅ Original session restored');
			} else {
				console.log('ℹ️ No original session to restore');
			}

			console.log('🔄 Refreshing linked accounts status...');
			setTimeout(async () => {
				await checkLinkedAccounts();
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
			setIsLoading(false);
		}
	};

	const unlinkAppleAccount = async () => {
		if (!user) return;

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
						setIsLoading(true);
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
							setIsLoading(false);
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
		isLoading,
	};
};
