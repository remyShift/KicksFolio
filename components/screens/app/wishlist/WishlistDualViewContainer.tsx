import { useMemo } from 'react';
import { View } from 'react-native';
import { Sneaker } from '@/types/sneaker';
import SneakersCardByBrand from '@/components/screens/app/profile/displayState/card/SneakersCardByBrand';
import SneakersListView from '@/components/screens/app/profile/displayState/list/SneakersListView';
import { useViewDisplayStateStore, ViewDisplayState } from '@/store/useViewDisplayStateStore';

interface WishlistDualViewContainerProps {
  wishlistSneakers: Sneaker[];
  onSneakerPress: (sneaker: Sneaker) => void;
}

export default function WishlistDualViewContainer({
  wishlistSneakers,
  onSneakerPress,
}: WishlistDualViewContainerProps) {
  const { viewDisplayState } = useViewDisplayStateStore();
  
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

  const isCardView = viewDisplayState === ViewDisplayState.Card;

  return (
    <View className="flex-1 gap-8">
      <View 
        testID="card-view-container"
        style={{ 
          display: isCardView ? 'flex' : 'none',
          flex: 1 
        }}
      >
        <SneakersCardByBrand 
          sneakersByBrand={sneakersByBrand}
          onSneakerPress={onSneakerPress}
          showOwnerInfo={true}
        />
      </View>

      <View 
        style={{ 
          display: !isCardView ? 'flex' : 'none',
          flex: 1 
        }}
      >
        <SneakersListView 
          sneakers={wishlistSneakers}
          onSneakerPress={onSneakerPress}
          scrollEnabled={false}
          showOwnerInfo={true}
        />
      </View>
    </View>
  );
} 