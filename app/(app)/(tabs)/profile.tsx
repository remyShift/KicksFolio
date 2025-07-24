import { RefreshControl, ScrollView, View } from 'react-native';
import { useSession } from '@/context/authContext';
import { useState, useMemo, useCallback } from 'react';
import { Sneaker, ViewMode } from '@/types/Sneaker';
import { router } from 'expo-router';
import EmptySneakersState from '@/components/screens/app/profile/displayState/EmptySneakersState';
import SneakersCardByBrand from '@/components/screens/app/profile/displayState/SneakersCardByBrand';
import SneakersListView from '@/components/screens/app/profile/displayState/SneakersListView';
import { useModalStore } from '@/store/useModalStore';
import ProfileHeader from '@/components/screens/app/profile/ProfileHeader';

export default function Profile() {
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

  if (!user) {
    return;
  }

  if (!userSneakers || userSneakers.length === 0) {
    return (
      <ScrollView
        className="flex-1 mt-16"
        testID="scroll-view"
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#FF6B6B"
            progressViewOffset={60}
            testID="refresh-control"
          />
        }
      >
        <ProfileHeader user={user} userSneakers={[]} viewMode={viewMode} setViewMode={setViewMode} />
        <EmptySneakersState onAddPress={handleAddSneaker} />
      </ScrollView>
    );
  }

  if (viewMode === 'card') {
    return (
      <ScrollView
        className="flex-1 mt-16"
        testID="scroll-view"
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#FF6B6B"
            progressViewOffset={60}
            testID="refresh-control"
          />
        }
      >
        <ProfileHeader user={user} userSneakers={userSneakers} viewMode={viewMode} setViewMode={setViewMode} />
        <View className="flex-1 gap-8">
          <SneakersCardByBrand 
            sneakersByBrand={sneakersByBrand}
            onSneakerPress={handleSneakerPress}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <View className="flex-1 mt-16">
      <SneakersListView 
        sneakers={userSneakers}
        onSneakerPress={handleSneakerPress}
        header={<ProfileHeader user={user} userSneakers={userSneakers} viewMode={viewMode} setViewMode={setViewMode} />}
        refreshing={refreshing}
        onRefresh={onRefresh}
        scrollEnabled={true}
      />
    </View>
  );
}