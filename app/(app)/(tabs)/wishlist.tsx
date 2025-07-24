import { RefreshControl, ScrollView, View } from 'react-native';
import { useSession } from '@/context/authContext';
import { useState, useMemo, useCallback } from 'react';
import { Sneaker } from '@/types/Sneaker';
import EmptyWishlistState from '@/components/screens/app/wishlist/EmptyWishlistState';
import WishlistHeader from '@/components/screens/app/wishlist/WishlistHeader';
import SneakersCardByBrand from '@/components/screens/app/profile/displayState/SneakersCardByBrand';
import SneakersListView from '@/components/screens/app/profile/displayState/SneakersListView';
import { useModalStore } from '@/store/useModalStore';

type ViewMode = 'card' | 'list';

export default function Wishlist() {
  const { wishlistSneakers, refreshUserData } = useSession();
  const { setModalStep, setIsVisible, setCurrentSneaker } = useModalStore();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  };

  const sneakersByBrand = useMemo(() => {
    if (!wishlistSneakers || wishlistSneakers.length === 0) return {};
    
    return wishlistSneakers.reduce((acc, sneaker) => {
      const normalizedBrand = sneaker.brand.toLowerCase().trim();
      
      if (!acc[normalizedBrand]) {
        acc[normalizedBrand] = [];
      }
      acc[normalizedBrand].push(sneaker);
      return acc;
    }, {} as Record<string, Sneaker[]>);
  }, [wishlistSneakers]);

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
        <WishlistHeader 
          wishlistSneakers={[]} 
          viewMode={viewMode} 
          setViewMode={setViewMode} 
        />
        <View testID="empty-wishlist-container">
          <EmptyWishlistState />
        </View>
      </ScrollView>
    );
  }

  if (viewMode === 'card') {
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
        <WishlistHeader 
          wishlistSneakers={wishlistSneakers} 
          viewMode={viewMode} 
          setViewMode={setViewMode} 
        />
        <View className="flex-1 gap-8" testID="card-view-container">
          <SneakersCardByBrand 
            sneakersByBrand={sneakersByBrand}
            onSneakerPress={handleSneakerPress}
            showOwnerInfo={true}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <View className="flex-1">
      <SneakersListView 
        sneakers={wishlistSneakers}
        onSneakerPress={handleSneakerPress}
        header={<WishlistHeader wishlistSneakers={wishlistSneakers} viewMode={viewMode} setViewMode={setViewMode} />}
        refreshing={refreshing}
        onRefresh={onRefresh}
        scrollEnabled={true}
        showOwnerInfo={true}
      />
    </View>
  );
}
