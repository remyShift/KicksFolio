import { useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { router } from 'expo-router';

import MainButton from '@/components/ui/buttons/MainButton';
import CollectionCard from '@/components/ui/cards/CollectionCard';
import FollowingTitle from '@/components/ui/text/FollowingTitle';
import PageTitle from '@/components/ui/text/PageTitle';
import Title from '@/components/ui/text/Title';
import { useSession } from '@/contexts/authContext';
import { useModalStore } from '@/store/useModalStore';

export default function Index() {
	const { t } = useTranslation();
	const { user, userSneakers, followingUsers } = useSession();
	const { setModalStep, setIsVisible } = useModalStore();

	useEffect(() => {
		if (user && (!userSneakers || userSneakers.length === 0)) {
			const timeoutId = setTimeout(() => {
				setModalStep('index');
				setIsVisible(true);
			}, 1000);

			return () => clearTimeout(timeoutId);
		}
	}, [user, userSneakers, setModalStep, setIsVisible]);

	return (
		<ScrollView className="flex-1">
			<View className="flex-1 gap-8 mt-20">
				<PageTitle content="KicksFolio" />
				<View className="flex-1 gap-4">
					<Title content={t('collection.pages.titles.collection')} />
					<View className="flex-1 px-4">
						<CollectionCard
							userSneakers={userSneakers}
							isOwnCollection={true}
						/>
					</View>
				</View>

				{followingUsers && followingUsers.length > 0 ? (
					<View className="flex-1 gap-4">
						<View className="flex-1 gap-8">
							{followingUsers.map((followingUser) => (
								<View
									className="flex-1 gap-2"
									key={followingUser.id}
								>
									<FollowingTitle
										content={followingUser.username}
										userAvatar={
											followingUser.profile_picture
										}
									/>
									<View className="flex-1 px-4">
										<CollectionCard
											isOwnCollection={false}
											userId={followingUser.id}
											userSneakers={
												followingUser.sneakers || []
											}
										/>
									</View>
								</View>
							))}
						</View>
					</View>
				) : (
					<View className="flex-1 gap-4 items-center justify-center pt-24">
						<Title
							content={t('search.noFollowingUsers')}
							isTextCenter={true}
						/>
						<MainButton
							content={t('search.buttons.browse')}
							onPressAction={() => {
								router.push('/(app)/(tabs)/search');
							}}
							backgroundColor="bg-primary"
						/>
					</View>
				)}
			</View>
		</ScrollView>
	);
}
