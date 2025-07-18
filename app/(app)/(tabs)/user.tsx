import { RefreshControl, ScrollView, View } from 'react-native';
import { useSession } from '@/context/authContext';
import { useState, useMemo, useCallback } from 'react';
import { Sneaker } from '@/types/Sneaker';
import { router } from 'expo-router';
import EmptySneakersState from '@/components/screens/app/profile/displayState/EmptySneakersState';
import SneakersCardByBrand from '@/components/screens/app/profile/displayState/SneakersCardByBrand';
import SneakersListView from '@/components/screens/app/profile/displayState/SneakersListView';
import { useModalStore } from '@/store/useModalStore';
import ProfileHeader from '@/components/screens/app/profile/ProfileHeader';

type ViewMode = 'card' | 'list';

export default function User() {
  const { user, userSneakers, refreshUserData } = useSession();
  const { setModalStep, setIsVisible, setCurrentSneaker } = useModalStore();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await refreshUserData();
    }
    setRefreshing(false);
  };

  const sneakersByBrand = useMemo(() => {
    if (!userSneakers || userSneakers.length === 0) return {};
    
    return userSneakers.reduce((acc, sneaker) => {
      const normalizedBrand = sneaker.brand.toLowerCase().trim();
      
      if (!acc[normalizedBrand]) {
        acc[normalizedBrand] = [];
      }
      acc[normalizedBrand].push(sneaker);
      return acc;
    }, {} as Record<string, Sneaker[]>);
  }, [userSneakers]);

  const handleAddSneaker = () => {
    setModalStep('index');
    setIsVisible(true);
  };

  const handleSneakerPress = (sneaker: Sneaker) => {
    setCurrentSneaker(sneaker);
    setModalStep('view');
    setIsVisible(true);
  };

  const handleMenuPress = useCallback(() => {
    router.push('/settings');
  }, []);

  if (!user) {
    return;
  }

  return (
    <ScrollView
      className="flex-1 mt-16"
      testID="scroll-view"
      scrollEnabled={true}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor="#FF6B6B"
          progressViewOffset={60}
          testID="refresh-control"
        />
    }>
      <ProfileHeader user={user} userSneakers={userSneakers || []} viewMode={viewMode} setViewMode={setViewMode} onMenuPress={handleMenuPress} />

      {!userSneakers || userSneakers.length === 0 ? (
          <EmptySneakersState onAddPress={handleAddSneaker} />
      ) : viewMode === 'card' ? (
          <View className="flex-1 gap-8">
            <SneakersCardByBrand 
              sneakersByBrand={sneakersByBrand}
              onSneakerPress={handleSneakerPress}
            />
          </View>
      ) : (
        <View className="flex-1">
          <SneakersListView 
            sneakers={userSneakers}
            onSneakerPress={handleSneakerPress}
            refreshing={refreshing}
            onRefresh={onRefresh}
            scrollEnabled={false}
          />
        </View>
      )}
    </ScrollView>
  );
}