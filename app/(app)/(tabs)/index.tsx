import { ScrollView, View } from 'react-native';
import { useSession } from '@/context/authContext';
import { useEffect } from 'react';
import Title from '@/components/ui/text/Title';
import CollectionCard from '@/components/ui/cards/CollectionCard';
import { useModalStore } from '@/store/useModalStore';
import { useTranslation } from 'react-i18next';
import FollowerTitle from '@/components/ui/text/FollowerTitle';
import MainButton from '@/components/ui/buttons/MainButton';
import { router } from 'expo-router';

export default function Index() {
    const { t } = useTranslation();
    const { user, userSneakers, followingUsers } = useSession();
    const { setModalStep, setIsVisible } = useModalStore();

    useEffect(() => {
        if (user && (!userSneakers || userSneakers.length === 0)) {
            setTimeout(() => {
                setModalStep('index');
                setIsVisible(true);
            }, 1000);
        }
    }, [user, userSneakers, setModalStep, setIsVisible]);

    return (
        <ScrollView className="flex-1 pt-32">
            <View className='flex-1 gap-8'>
                <View className="flex-1 gap-4">
                    <Title content={t('collection.pages.titles.collection')} />
                    <View className="flex-1 px-4">
                        <CollectionCard userSneakers={userSneakers} isOwnCollection={true} />
                    </View>
                </View>
                
                {followingUsers && followingUsers.length > 0 ? (
                    <View className="flex-1 gap-4">
                        <View className="flex-1 px-4">
                            {followingUsers.map((followingUser) => (
                                <View className="flex-1 gap-2" key={followingUser.id}>
                                    <FollowerTitle 
                                        content={followingUser.username}
                                        userAvatar={followingUser.profile_picture}
                                    />
                                    <CollectionCard
                                        isOwnCollection={false}
                                        userId={followingUser.id}
                                        userSneakers={followingUser.sneakers || []}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View className="flex-1 gap-4 items-center justify-center pt-24">
                        <Title content={t('search.noFollowingUsers')} isTextCenter={true} />
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
