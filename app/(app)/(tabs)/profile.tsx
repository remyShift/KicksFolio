import { useState } from 'react';
import { useSession } from '@/context/authContext';
import { Sneaker } from '@/types/sneaker';
import { useModalStore } from '@/store/useModalStore';
import ProfileDisplayContainer from '@/components/screens/app/profile/ProfileDisplayContainer';

export default function Profile() {
  const { user, userSneakers, refreshUserData } = useSession();
  const { setModalStep, setIsVisible, setCurrentSneaker } = useModalStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await refreshUserData();
    }
    setRefreshing(false);
  };

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
    return null;
  }

  return (
    <ProfileDisplayContainer
      user={user}
      userSneakers={userSneakers || []}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onSneakerPress={handleSneakerPress}
      onAddSneaker={handleAddSneaker}
      showBackButton={false}
    />
  );
}