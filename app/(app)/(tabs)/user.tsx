import { RefreshControl, ScrollView, View } from 'react-native';
import { useSession } from '@/context/authContext';
import { useState, useMemo } from 'react';
import { Sneaker } from '@/types/Sneaker';
import { useAuth } from '@/hooks/useAuth';
import AddButton from '@/components/ui/buttons/AddButton';
import ProfileHeader from '@/components/screens/app/profile/ProfileHeader';
import ProfileInfo from '@/components/screens/app/profile/ProfileInfo';
import EmptySneakersState from '@/components/screens/app/profile/EmptySneakersState';
import SneakersByBrand from '@/components/screens/app/profile/SneakersByBrand';
import ProfileDrawer from '@/components/screens/app/profile/ProfileDrawer';
import SneakersModalWrapper from '@/components/screens/app/profile/SneakersModalWrapper';
import { useModalStore } from '@/store/useModalStore';

export default function User() {
  const { user, userSneakers, sessionToken, refreshUserData } = useSession();
  const { logout } = useAuth();
  const { setModalStep, setIsVisible, setCurrentSneaker } = useModalStore();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user && sessionToken) {
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

  return (
    <>
      <ScrollView className="flex-1"
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#FF6B6B"
            progressViewOffset={60}
          />
        }
      >
        <View className="flex-1 gap-12">
          <ProfileHeader onMenuPress={() => setDrawerVisible(true)} />
          
          <View className="flex-1 gap-12">
            <ProfileInfo user={user} userSneakers={userSneakers} />

            {userSneakers && userSneakers.length === 0 || !userSneakers ? (
              <EmptySneakersState onAddPress={handleAddSneaker} />
            ) : (
              <SneakersByBrand 
                sneakersByBrand={sneakersByBrand}
                onSneakerPress={handleSneakerPress}
              />
            )}
          </View>
        </View>

        <SneakersModalWrapper />
      </ScrollView>

      <ProfileDrawer 
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onLogout={() => logout(sessionToken!)}
        user={user}
        sessionToken={sessionToken}
      />

      {userSneakers && userSneakers.length > 0 && (
        <AddButton onPress={handleAddSneaker} />
      )}
    </>
  );
}
