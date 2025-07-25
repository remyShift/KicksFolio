import { RefreshControl, ScrollView, View } from 'react-native';
import { useSession } from '@/context/authContext';
import { useState, useMemo } from 'react';
import { Sneaker } from '@/types/Sneaker';
import EmptySneakersState from '@/components/screens/app/profile/displayState/EmptySneakersState';
import { useModalStore } from '@/store/useModalStore';
import ProfileHeader from '@/components/screens/app/profile/ProfileHeader';
import CardDisplay from '@/components/screens/app/profile/displayState/card/CardDisplay';
import ListDisplay from '@/components/screens/app/profile/displayState/list/ListDisplay';
import { useViewDisplayStateStore, ViewDisplayState } from '@/store/useViewDisplayStateStore';

export default function Profile() {
  const { user, userSneakers, refreshUserData } = useSession();
  const { setModalStep, setIsVisible, setCurrentSneaker } = useModalStore();
  const [refreshing, setRefreshing] = useState(false);
  const { viewDisplayState } = useViewDisplayStateStore();

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
        <ProfileHeader user={user} userSneakers={[]} />
        <EmptySneakersState onAddPress={handleAddSneaker} />
      </ScrollView>
    );
  }

  if (viewDisplayState === ViewDisplayState.Card) {
    return (
      <CardDisplay
        sneakersByBrand={sneakersByBrand}
        handleSneakerPress={handleSneakerPress}
        refreshing={refreshing}
        onRefresh={onRefresh}
        user={user}
        userSneakers={userSneakers}
      />
    );
  }

  return (
    <ListDisplay
      userSneakers={userSneakers}
      handleSneakerPress={handleSneakerPress}
      refreshing={refreshing}
      onRefresh={onRefresh}
      user={user}
    />
  );
}