import { RefreshControl, ScrollView, View } from 'react-native';
import { useSession } from '@/context/authContext';
import { useState, useMemo, useCallback } from 'react';
import { Sneaker } from '@/types/Sneaker';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';
import AddButton from '@/components/ui/buttons/AddButton';
import EmptySneakersState from '@/components/screens/app/profile/displayState/EmptySneakersState';
import SneakersCardByBrand from '@/components/screens/app/profile/displayState/SneakersCardByBrand';
import SneakersListView from '@/components/screens/app/profile/displayState/SneakersListView';
import SneakersModalWrapper from '@/components/screens/app/SneakersModalWrapper';
import { useModalStore } from '@/store/useModalStore';
import ProfileHeader from '@/components/screens/app/profile/ProfileHeader';

type ViewMode = 'card' | 'list';

export default function User() {
  const { user, userSneakers, refreshUserData } = useSession();
  const { logout } = useAuth();
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

  if (!userSneakers || userSneakers.length === 0) {
    return (
      <>
        <ScrollView 
          className="flex-1"
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
          <View className="flex-1 gap-12">
            <ProfileHeader user={user} userSneakers={userSneakers!} viewMode={viewMode} setViewMode={setViewMode} onMenuPress={handleMenuPress} />
            <EmptySneakersState onAddPress={handleAddSneaker} />
          </View>
          <SneakersModalWrapper />
        </ScrollView>
      </>
    );
  }

  return (
    <>
      <ProfileHeader user={user} userSneakers={userSneakers} viewMode={viewMode} setViewMode={setViewMode} onMenuPress={handleMenuPress} />
      
      {viewMode === 'card' ? (
        <ScrollView 
          className="flex-1"
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
          <View className="flex-1 gap-8">
            <SneakersCardByBrand 
              sneakersByBrand={sneakersByBrand}
              onSneakerPress={handleSneakerPress}
            />
          </View>
          <SneakersModalWrapper />
        </ScrollView>
      ) : (
        <View className="flex-1">
          <SneakersListView 
            sneakers={userSneakers}
            onSneakerPress={handleSneakerPress}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
          <SneakersModalWrapper />
        </View>
      )}

      {userSneakers && userSneakers.length > 0 && (
        <AddButton onPress={handleAddSneaker} />
      )}
    </>
  );
}
