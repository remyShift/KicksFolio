import { ScrollView, View } from 'react-native';
import { useSession } from '@/context/authContext';
import { useEffect, useState, useCallback } from 'react';
import Title from '@/components/ui/text/Title';
import CollectionCard from '@/components/ui/cards/CollectionCard';
import { useModalStore } from '@/store/useModalStore';
import useToast from '@/hooks/useToast';
import { useTranslation } from 'react-i18next';
import { FollowerService, FollowingUser } from '@/services/FollowerService';
import { UserSearchService } from '@/services/UserSearchService';
import FollowerTitle from '@/components/ui/text/FollowerTitle';
import { Sneaker } from '@/types/Sneaker';

interface FollowingWithSneakers {
    user: FollowingUser;
    sneakers: Sneaker[];
}

export default function Index() {
    const { t } = useTranslation();
    const { user, userSneakers } = useSession();
    const { setModalStep, setIsVisible } = useModalStore();
    const { showErrorToast } = useToast();
    
    const [followingCollections, setFollowingCollections] = useState<FollowingWithSneakers[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadFollowingCollections = useCallback(async () => {
        if (!user?.id || isLoading) return;

        setIsLoading(true);
        
        try {
            const followingUsers = await FollowerService.getFollowingUsers(user.id);
            
            if (followingUsers.length === 0) {
                setFollowingCollections([]);
                return;
            }

            const collectionsWithSneakers = await Promise.all(
                followingUsers.map(async (followingUser) => {
                    try {
                        const sneakers = await UserSearchService.getUserSneakers(followingUser.id);
                        return {
                            user: followingUser,
                            sneakers: sneakers || []
                        };
                    } catch (error) {
                        // Si erreur pour un utilisateur, on retourne quand même quelque chose
                        return {
                            user: followingUser,
                            sneakers: []
                        };
                    }
                })
            );

            setFollowingCollections(collectionsWithSneakers);
            
        } catch (error) {
            console.error('Error loading following collections:', error);
            // Garder les données existantes en cas d'erreur
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, isLoading]);

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
    }, [user?.id]);

    return (
        <ScrollView className="flex-1 pt-32">
            <View className='flex-1 gap-8'>
                <View className="flex-1 gap-4">
                    <Title content={t('collection.pages.titles.collection')} />
                    <View className="flex-1 px-4">
                        <CollectionCard userSneakers={userSneakers} isOwnCollection={true} />
                    </View>
                </View>
                
                {followingCollections.length > 0 && (
                    <View className="flex-1 gap-4">
                        <View className="flex-1 px-4">
                            {followingCollections.map((collection) => (
                                <View className="flex-1 gap-2" key={collection.user.id}>
                                    <FollowerTitle 
                                        content={collection.user.username} 
                                    />
                                    <CollectionCard
                                        isOwnCollection={false}
                                        userId={collection.user.id}
                                        userSneakers={collection.sneakers}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
