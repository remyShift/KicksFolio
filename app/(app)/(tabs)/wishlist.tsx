import { RefreshControl, ScrollView, View } from 'react-native';
import { useSession } from '@/context/authContext';
import { useState } from 'react';
import { Sneaker } from '@/types/Sneaker';
import EmptyWishlistState from '@/components/screens/app/wishlist/EmptyWishlistState';
import WishlistHeader from '@/components/screens/app/wishlist/WishlistHeader';
import WishlistDualViewContainer from '@/components/screens/app/wishlist/WishlistDualViewContainer';
import { useModalStore } from '@/store/useModalStore';

export default function Wishlist() {
  const { wishlistSneakers, refreshUserData } = useSession();
  const { setModalStep, setIsVisible, setCurrentSneaker } = useModalStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  };

  const handleSneakerPress = (sneaker: Sneaker) => {
    setCurrentSneaker(sneaker);
    setModalStep('view');
    setIsVisible(true);
  };

  if (!wishlistSneakers || wishlistSneakers.length === 0) {
    return (
      <ScrollView 
        className="flex-1"
        testID="wishlist-scroll-view"
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
        <WishlistHeader wishlistSneakers={[]} />
        <View testID="empty-wishlist-container">
          <EmptyWishlistState />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      className="flex-1"
      testID="wishlist-scroll-view"
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
      <WishlistHeader wishlistSneakers={wishlistSneakers} />
      <WishlistDualViewContainer
        wishlistSneakers={wishlistSneakers}
        onSneakerPress={handleSneakerPress}
      />
    </ScrollView>
  );
}
