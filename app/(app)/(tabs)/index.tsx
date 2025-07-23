import { ScrollView, View, Button } from 'react-native';
import { useSession } from '@/context/authContext';
import { useEffect, useState, useCallback } from 'react';
import Title from '@/components/ui/text/Title';
import CollectionCard from '@/components/ui/cards/CollectionCard';
import FollowingCollectionCard from '@/components/ui/cards/FollowingCollectionCard';
import MainButton from '@/components/ui/buttons/MainButton';
import { useModalStore } from '@/store/useModalStore';
import useToast from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';
import { FollowerService, FollowingUser } from '@/services/FollowerService';
import { UserSearchService } from '@/services/UserSearchService';

interface FollowingWithSneakers {
    user: FollowingUser;
    sneakers: any[];
}

export default function Index() {
    const { t } = useTranslation();
    const { user, userSneakers } = useSession();
    const { setModalStep, setIsVisible } = useModalStore();
    const { showInfoToast, showErrorToast } = useToast();
    
    const [followingCollections, setFollowingCollections] = useState<FollowingWithSneakers[]>([]);
    const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);

    const loadFollowingCollections = useCallback(async () => {
        if (!user?.id) return;

        setIsLoadingFollowing(true);
        
        try {
            const followingUsers = await FollowerService.getFollowingUsers(user.id);
            
            const collectionsWithSneakers = await Promise.all(
                followingUsers.map(async (followingUser) => {
                    const sneakers = await UserSearchService.getUserSneakers(followingUser.id);
                    return {
                        user: followingUser,
                        sneakers: sneakers || []
                    };
                })
            );

            setFollowingCollections(collectionsWithSneakers);
        } catch (error) {
            console.error('Error loading following collections:', error);
            showErrorToast(
                'Erreur de chargement',
                'Impossible de charger les collections des utilisateurs suivis.'
            );
        } finally {
            setIsLoadingFollowing(false);
        }
    }, [user?.id, showErrorToast]);

    useEffect(() => {
        if (user && (!userSneakers || userSneakers.length === 0)) {
            setTimeout(() => {
                setModalStep('index');
                setIsVisible(true);
            }, 1000);
        }
    }, [user, userSneakers, setModalStep, setIsVisible]);

    useEffect(() => {
        loadFollowingCollections();
    }, [loadFollowingCollections]);

    return (
        <ScrollView className="flex-1 pt-32">
                <View className='flex-1 gap-8'>
                    <View className="flex-1 gap-4">
                        <Title content={t('collection.pages.titles.collection')} />
                        <View className="flex-1 px-4">
                            <CollectionCard userSneakers={userSneakers} />
                        </View>
                    </View>
                    
                    {followingCollections.length > 0 && (
                        <View className="flex-1 gap-4">
                            <Title content="Collections suivies" />
                            <View className="flex-1 px-4">
                                {followingCollections.map((collection) => (
                                    <FollowingCollectionCard
                                        key={collection.user.id}
                                        followingUser={collection.user}
                                        userSneakers={collection.sneakers}
                                    />
                                ))}
                            </View>
                        </View>
                    )}
                </View>
        </ScrollView>
    );
}
