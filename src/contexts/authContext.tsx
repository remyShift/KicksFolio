import {
	createContext,
	type PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from 'react';

import { useAppState } from '@react-native-community/hooks';

import * as Linking from 'expo-linking';
import { router } from 'expo-router';

import { supabase } from '@/config/supabase/supabase';
import { Auth } from '@/domain/Auth';
import { FollowerHandler } from '@/domain/FollowerHandler';
import { SneakerHandler } from '@/domain/SneakerHandler';
import { UserLookup } from '@/domain/UserLookup';
import { Wishlist } from '@/domain/Wishlist';
import { useNotifications } from '@/hooks/notifications/useNotifications';
import { usePushNotifications } from '@/hooks/notifications/usePushNotifications';
import { storageProvider } from '@/services/StorageService';
import { authProxy } from '@/tech/proxy/AuthProxy';
import { followerProxy } from '@/tech/proxy/FollowerProxy';
import { sneakerProxy } from '@/tech/proxy/SneakerProxy';
import { userLookupProxy } from '@/tech/proxy/UserLookupProxy';
import { wishlistProxy } from '@/tech/proxy/WishlistProxy';
import { AuthContextType, FollowingUserWithSneakers } from '@/types/auth';
import { Sneaker } from '@/types/sneaker';
import { User } from '@/types/user';
import { extractOAuthData, isProfileComplete } from '@/utils/profileUtils';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useSession() {
	const value = useContext(AuthContext);
	if (process.env.NODE_ENV !== 'production') {
		if (!value) {
			throw new Error(
				'useSession must be wrapped in a <SessionProvider />'
			);
		}
	}
	return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
	const appState = useAppState();
	const [isLoading, setIsLoading] = useState(true);
	const [resetTokens, setResetTokens] = useState<{
		access_token: string;
		refresh_token: string;
	} | null>(null);

	const {
		unreadCount,
		refreshNotifications,
		fetchUnreadCount,
		startPolling,
		stopPolling,
		markAllAsRead,
		flushPendingNotifications,
	} = useNotifications();
	const { registerForPushNotifications, setBadgeCount, hasPermission } =
		usePushNotifications();

	const [user, setUser] = useState<User | null>(null);
	const [notificationPolling, setNotificationPolling] = useState<ReturnType<
		typeof setInterval
	> | null>(null);
	const [userSneakers, setUserSneakers] = useState<Sneaker[] | null>(null);
	const [wishlistSneakers, setWishlistSneakers] = useState<Sneaker[] | null>(
		null
	);
	const [followingUsers, setFollowingUsers] = useState<
		FollowingUserWithSneakers[] | null
	>(null);

	const auth = new Auth(authProxy);
	const followerHandler = new FollowerHandler(followerProxy);
	const sneakerHandler = new SneakerHandler(sneakerProxy);
	const userLookup = new UserLookup(userLookupProxy);

	const wishlist = new Wishlist(wishlistProxy);

	useEffect(() => {
		const handleDeepLink = (url: string) => {
			if (url.includes('reset-password')) {
				const fragmentPart = url.split('#')[1];

				if (fragmentPart) {
					const params = new URLSearchParams(fragmentPart);

					const error = params.get('error');
					const errorCode = params.get('error_code');

					if (error) {
						if (errorCode === 'otp_expired') {
							router.replace({
								pathname: '/login',
								params: {
									error: 'reset_link_expired',
								},
							});
						} else {
							router.replace({
								pathname: '/login',
								params: {
									error: 'reset_link_invalid',
								},
							});
						}
						return;
					}

					const accessToken = params.get('access_token');
					const refreshToken = params.get('refresh_token');

					if (accessToken && refreshToken) {
						setResetTokens({
							access_token: accessToken,
							refresh_token: refreshToken,
						});
					} else {
						router.replace({
							pathname: '/login',
							params: {
								error: 'reset_link_invalid',
							},
						});
					}
				} else {
					router.replace({
						pathname: '/login',
						params: {
							error: 'reset_link_invalid',
						},
					});
				}
			}
		};

		Linking.getInitialURL().then((url) => {
			if (url) {
				handleDeepLink(url);
			}
		});

		const linkingListener = Linking.addEventListener('url', (event) => {
			handleDeepLink(event.url);
		});

		return () => {
			linkingListener.remove();
		};
	}, []);

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			if (session?.user && !session.user.is_anonymous) {
				const isOAuthProvider =
					session.user.app_metadata?.provider &&
					['google', 'apple'].includes(
						session.user.app_metadata.provider
					);

				if (isOAuthProvider && event === 'SIGNED_IN') {
					console.log('🔍 OAuth sign-in detected', {
						provider: session.user.app_metadata?.provider,
						userId: session.user.id,
						event: event,
					});

					try {
						const existingUser = await auth.getCurrentUser();
						console.log('✅ Found existing user in database:', {
							id: existingUser.id,
							email: existingUser.email,
							username: existingUser.username,
						});

						if (isProfileComplete(existingUser)) {
							console.log(
								'✅ Profile is complete, checking OAuth linking...'
							);

							// Check if this OAuth account is already linked
							const provider = session.user.app_metadata
								?.provider as 'google' | 'apple';
							const oauthUserId = session.user.id;

							try {
								console.log(
									'🔍 Checking if OAuth account is linked:',
									{
										provider,
										oauthUserId,
										existingUserId: existingUser.id,
									}
								);
								const existingLink =
									await authProxy.findUserByOAuthAccount(
										provider,
										oauthUserId
									);
								console.log(
									'🔍 OAuth link check result:',
									existingLink
								);

								if (!existingLink) {
									console.log(
										'🔗 OAuth account not linked, creating automatic link...'
									);
									console.log('🔗 Link parameters:', {
										userId: existingUser.id,
										provider,
										providerAccountId: oauthUserId,
									});
									await authProxy.linkOAuthAccount(
										existingUser.id,
										provider,
										oauthUserId
									);
									console.log(
										'✅ OAuth account automatically linked to existing user'
									);
								} else {
									console.log(
										'✅ OAuth account already properly linked to user:',
										existingLink
									);
								}
							} catch (linkError) {
								console.error(
									'❌ Could not check/create OAuth link:',
									linkError
								);
								// Continue anyway - not critical for login
							}

							await initializeUserData(session.user.id);
							setIsLoading(false);
							return;
						} else {
							console.log(
								'⚠️ User exists but profile incomplete'
							);
						}
					} catch (error) {
						console.log(
							'ℹ️ No user in database, checking OAuth links and pending users:',
							error
						);

						const provider = session.user.app_metadata?.provider;
						const oauthUserId = session.user.id;

						try {
							console.log(
								'🔍 Searching for existing user with OAuth account:',
								{
									provider,
									oauthUserId,
								}
							);

							const linkedUserId =
								await authProxy.findUserByOAuthAccount(
									provider as 'google' | 'apple',
									oauthUserId
								);

							if (linkedUserId) {
								console.log(
									'✅ Found linked OAuth account for existing user:',
									linkedUserId
								);

								console.log(
									'🔄 Initializing data for linked user with OAuth session'
								);

								try {
									const {
										data: linkedUserData,
										error: linkedUserError,
									} = await supabase
										.from('users')
										.select('*')
										.eq('id', linkedUserId)
										.single();

									if (linkedUserError || !linkedUserData) {
										throw new Error(
											'Linked user not found in database'
										);
									}

									console.log('✅ Found linked user data:', {
										id: linkedUserData.id,
										username: linkedUserData.username,
										email: linkedUserData.email,
									});

									const [followersResult, followingResult] =
										await Promise.all([
											supabase
												.from('followers')
												.select('*', {
													count: 'exact',
													head: true,
												})
												.eq(
													'following_id',
													linkedUserId
												),
											supabase
												.from('followers')
												.select('*', {
													count: 'exact',
													head: true,
												})
												.eq(
													'follower_id',
													linkedUserId
												),
										]);

									const followersCount = followersResult.error
										? 0
										: followersResult.count || 0;
									const followingCount = followingResult.error
										? 0
										: followingResult.count || 0;

									const userWithCounts = {
										...linkedUserData,
										followers_count: followersCount,
										following_count: followingCount,
										profile_picture_url:
											linkedUserData.profile_picture,
									};

									setUser(userWithCounts as User);
									storageProvider.setUserData(
										userWithCounts as User
									);

									await Promise.all([
										loadUserSneakers(userWithCounts),
										loadFollowingUsers(linkedUserId),
										initializeNotifications(),
									]);

									setIsLoading(false);
									return;
								} catch (linkedUserError) {
									console.error(
										'❌ Error loading linked user data:',
										linkedUserError
									);
								}
							}
						} catch (linkError) {
							console.log(
								'⚠️ Error checking linked accounts:',
								linkError
							);
						}

						try {
							const pendingUser =
								await authProxy.getPendingOAuthUser(
									oauthUserId
								);
							if (pendingUser) {
								console.log(
									'✅ Found existing pending OAuth user, redirecting to completion'
								);
								const oauthData = extractOAuthData(
									session.user
								);
								const queryParams = new URLSearchParams(
									oauthData
								).toString();

								setTimeout(() => {
									router.push(
										`/(auth)/oauth-profile-completion?${queryParams}`
									);
								}, 100);

								setIsLoading(false);
								return;
							}
						} catch (pendingError) {
							console.log(
								'ℹ️ No pending OAuth user found:',
								pendingError
							);
						}

						console.log(
							'➡️ New OAuth user, storing as pending and redirecting to completion'
						);
						const oauthData = extractOAuthData(session.user);

						try {
							await authProxy.storePendingOAuthUser(
								oauthUserId,
								session.user.email || '',
								provider as 'google' | 'apple',
								oauthUserId,
								oauthData.profile_picture
							);
							console.log('✅ OAuth user stored as pending');
						} catch (storeError) {
							console.error(
								'❌ Error storing pending OAuth user:',
								storeError
							);
						}

						const queryParams = new URLSearchParams(
							oauthData
						).toString();

						setTimeout(() => {
							router.push(
								`/(auth)/oauth-profile-completion?${queryParams}`
							);
						}, 100);

						setIsLoading(false);
						return;
					}

					console.log('➡️ Redirecting to OAuth profile completion');
					const oauthData = extractOAuthData(session.user);
					const queryParams = new URLSearchParams(
						oauthData
					).toString();

					setTimeout(() => {
						router.push(
							`/(auth)/oauth-profile-completion?${queryParams}`
						);
					}, 100);

					setIsLoading(false);
					return;
				} else {
					await initializeUserData(session.user.id);
				}
			} else {
				clearUserData();
			}

			setIsLoading(false);
		});

		const checkInitialSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (session?.user && !session.user.is_anonymous) {
				return auth.getCurrentUser().catch((error: any) => {
					if (error) {
						return supabase.auth.signOut().then(() => {
							clearUserData();
						});
					}
					throw error;
				});
			}
		};
		checkInitialSession();

		return () => {
			subscription?.unsubscribe();
		};
	}, []);

	useEffect(() => {
		handleAppStateChange();
	}, [appState]);

	const loadUserSneakers = async (userWithUrl: User) => {
		const sneakersPromise = sneakerHandler.getByUserId(userWithUrl.id);
		const wishlistPromise = wishlist.getByUserId(userWithUrl.id);

		return Promise.all([sneakersPromise, wishlistPromise])
			.then(([sneakers, wishlistSneakers]) => {
				const userSneakers = sneakers || [];
				const userWishlistSneakers = wishlistSneakers || [];

				setUserSneakers(userSneakers);
				setWishlistSneakers(userWishlistSneakers);

				storageProvider.setSneakersData(userSneakers);
				storageProvider.setItem(
					'wishlistSneakers',
					userWishlistSneakers
				);

				userWithUrl.sneakers = userSneakers;
				setUser(userWithUrl);
				storageProvider.setUserData(userWithUrl);
			})
			.catch((error) => {
				console.error('Error loading user sneakers:', error);
				setUserSneakers([]);
				setWishlistSneakers([]);
				storageProvider.setSneakersData([]);
				storageProvider.setItem('wishlistSneakers', []);
			});
	};

	const initializeNotifications = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				console.log(
					'Skipping notification initialization: no authenticated user'
				);
				return;
			}

			await registerForPushNotifications();
			await refreshNotifications();

			const interval = startPolling();
			setNotificationPolling(interval);
		} catch (error) {
			console.warn('Failed to initialize notifications:', error);
		}
	};

	useEffect(() => {
		if (user && hasPermission) {
			setBadgeCount(unreadCount);
		} else if (!user) {
			setBadgeCount(0);
		}
	}, [unreadCount, user, hasPermission, setBadgeCount]);

	const loadFollowingUsers = async (userId: string) => {
		return followerHandler
			.getFollowing(userId)
			.then(async (followingUsers) => {
				const followingWithSneakers = await Promise.all(
					followingUsers.map(async (followingUser) => {
						try {
							const sneakers = await userLookup.getSneakers(
								followingUser.id
							);
							return {
								...followingUser,
								sneakers: sneakers || [],
							};
						} catch (error) {
							console.warn(
								`Error loading sneakers for user ${followingUser.id}:`,
								error
							);
							return {
								...followingUser,
								sneakers: [],
							};
						}
					})
				);

				setFollowingUsers(followingWithSneakers);
				storageProvider.setItem(
					'followingUsers',
					followingWithSneakers
				);

				return followingWithSneakers;
			})
			.catch((error) => {
				console.error(
					'❌ AuthContext.loadFollowingUsers - Error loading following users:',
					error
				);
				setFollowingUsers([]);
				storageProvider.setItem('followingUsers', []);
				return [];
			});
	};

	const initializeUserData = async (userId: string) => {
		const maxRetries = 3;
		const retryDelay = 1000;

		const getUserWithRetries = async (attempt: number): Promise<any> => {
			return auth
				.getCurrentUser()
				.then((userData: any) => {
					if (userData) {
						const userWithUrl = {
							...userData,
							profile_picture_url: userData.profile_picture,
						};
						setUser(userWithUrl as User);
						storageProvider.setUserData(userWithUrl as User);

						return Promise.all([
							loadUserSneakers(userWithUrl),
							loadFollowingUsers(userWithUrl.id),
							initializeNotifications(),
						]);
					} else if (attempt < maxRetries) {
						return new Promise((resolve) => {
							setTimeout(() => {
								resolve(getUserWithRetries(attempt + 1));
							}, retryDelay);
						});
					} else {
						return Promise.resolve();
					}
				})
				.catch((error: any) => {
					if (
						attempt < maxRetries &&
						(error.code === 'PGRST116' ||
							error.message?.includes('No user found') ||
							error.message?.includes('0 rows'))
					) {
						console.log(
							`Database sync pending, retrying... (attempt ${attempt + 1})`
						);
						return new Promise((resolve) => {
							setTimeout(() => {
								resolve(getUserWithRetries(attempt + 1));
							}, retryDelay);
						});
					} else {
						console.error(
							`Authentication error after ${attempt + 1} attempts:`,
							error
						);
						return Promise.resolve();
					}
				});
		};

		await getUserWithRetries(0);
	};

	const refreshUserData = async () => {
		const {
			data: { session },
			error: sessionError,
		} = await supabase.auth.getSession();

		if (sessionError) {
			console.error(
				'❌ refreshUserData: Error getting session:',
				sessionError
			);
			return;
		}

		if (!session?.user) {
			console.log(
				'ℹ️ refreshUserData: No valid session found, skipping data refresh'
			);
			return;
		}

		return auth
			.getCurrentUser()
			.then(async (freshUserData: any) => {
				if (!freshUserData) {
					return;
				}

				const userWithUrl = {
					...freshUserData,
					profile_picture_url: freshUserData.profile_picture,
				};

				await loadUserSneakers(userWithUrl);
				await loadFollowingUsers(userWithUrl.id);
			})
			.catch((error) => {
				if (
					!error.message?.includes('No user found') &&
					!error.message?.includes('0 rows') &&
					error.code !== 'PGRST116'
				) {
					console.error(
						'❌ refreshUserData: Error refreshing user data:',
						error
					);
				}
				if (error.code !== 'PGRST116') {
					setUserSneakers([]);
					setWishlistSneakers([]);
					storageProvider.setSneakersData([]);
					storageProvider.setItem('wishlistSneakers', []);
				}
			});
	};

	const refreshUserSneakers = async () => {
		if (!user?.id) {
			setUserSneakers([]);
			setWishlistSneakers([]);
			storageProvider.setSneakersData([]);
			storageProvider.setItem('wishlistSneakers', []);
			return;
		}

		const sneakersPromise = sneakerHandler.getByUserId(user.id);
		const wishlistPromise = wishlist.getByUserId(user.id);

		return Promise.all([sneakersPromise, wishlistPromise])
			.then(([sneakers, wishlistSneakers]) => {
				const userSneakers = sneakers || [];
				const userWishlistSneakers = wishlistSneakers || [];

				setUserSneakers(userSneakers);
				setWishlistSneakers(userWishlistSneakers);

				storageProvider.setSneakersData(userSneakers);
				storageProvider.setItem(
					'wishlistSneakers',
					userWishlistSneakers
				);
			})
			.catch((error) => {
				console.error('Error refreshing sneakers:', error);
				setUserSneakers([]);
				setWishlistSneakers([]);
				storageProvider.setSneakersData([]);
				storageProvider.setItem('wishlistSneakers', []);
			});
	};

	const refreshFollowingUsers = async () => {
		if (!user?.id) {
			setFollowingUsers([]);
			storageProvider.setItem('followingUsers', []);
			return;
		}

		await loadFollowingUsers(user.id);
	};

	const clearUserData = () => {
		setUser(null);
		setUserSneakers(null);
		setWishlistSneakers(null);
		setFollowingUsers(null);
		setResetTokens(null);

		setBadgeCount(0);

		if (notificationPolling) {
			stopPolling(notificationPolling);
			setNotificationPolling(null);
		}

		storageProvider.clearSessionData();
	};

	const handleAppStateChange = async () => {
		if (appState === 'background') {
			await flushPendingNotifications();
			await storageProvider.saveAppState({
				user,
				sneakers: userSneakers,
				followingUsers: followingUsers,
			});
		} else if (appState === 'active' && user) {
			try {
				await markAllAsRead();
				await fetchUnreadCount();
			} catch (error) {
				console.warn('Failed to mark notifications as read:', error);
			}
		}
	};

	return (
		<AuthContext.Provider
			value={{
				isLoading,
				user,
				setUser,
				userSneakers,
				setUserSneakers,
				refreshUserData,
				refreshUserSneakers,
				clearUserData,
				wishlistSneakers,
				resetTokens,
				followingUsers,
				setFollowingUsers,
				refreshFollowingUsers,
				unreadNotificationCount: unreadCount,
				refreshNotifications: fetchUnreadCount,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
