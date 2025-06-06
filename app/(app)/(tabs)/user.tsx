import { RefreshControl, ScrollView, View } from 'react-native';
import { useSession } from '@/context/authContext';
import { useState, useMemo, useEffect } from 'react';
import { Sneaker } from '@/types/Sneaker';
import { useAuth } from '@/hooks/useAuth';
import AddButton from '@/components/ui/buttons/AddButton';
import ProfileHeader from '@/components/screens/app/profile/ProfileHeader';
import ProfileInfo from '@/components/screens/app/profile/ProfileInfo';
import EmptySneakersState from '@/components/screens/app/profile/EmptySneakersState';
import SneakersByBrand from '@/components/screens/app/profile/SneakersByBrand';
import ProfileDrawer from '@/components/screens/app/profile/ProfileDrawer';
import SneakersModalWrapper from '@/components/screens/app/profile/SneakersModalWrapper';
import { useStepModalStore } from '@/store/useStepModalStore';

export default function User() {
  const { user, userSneakers, sessionToken, setUserSneakers } = useSession();
  const { logout, getUserSneakers, getUser } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const { setModalStep } = useStepModalStore();
  const [sneaker, setSneaker] = useState<Sneaker | null>(null);
  const [currentSneaker, setCurrentSneaker] = useState<Sneaker | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user && sessionToken) {
      console.log('onRefresh called', user);
      await getUser(sessionToken);
      console.log('getUser called', user);
      await getUserSneakers(user, sessionToken);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    setCurrentSneaker(sneaker);
  }, [sneaker]);

  useEffect(() => {
    if (user && sessionToken) {
      getUser(sessionToken);
      getUserSneakers(user, sessionToken);
    }
  }, [user, sessionToken]);

  const sneakersByBrand = useMemo(() => {
    if (!userSneakers) return {};
    return userSneakers.reduce((acc, sneaker) => {
      if (!acc[sneaker.brand]) {
        acc[sneaker.brand] = [];
      }
      acc[sneaker.brand].push(sneaker);
      return acc;
    }, {} as Record<string, typeof userSneakers>);
  }, [userSneakers]);

  const handleAddSneaker = () => {
    setModalStep('index');
    setModalVisible(true);
  };

  const handleSneakerPress = (sneaker: Sneaker) => {
    setSneaker(sneaker);
    setModalVisible(true);
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

        <SneakersModalWrapper 
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          sneaker={currentSneaker}
          userSneakers={userSneakers}
          setUserSneakers={setUserSneakers}
        />
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
