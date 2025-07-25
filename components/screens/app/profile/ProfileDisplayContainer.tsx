import { useState, useMemo, useEffect } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { Sneaker } from '@/types/Sneaker';
import { User } from '@/types/User';
import { SearchUser } from '@/services/UserSearchService';
import EmptySneakersState from './displayState/EmptySneakersState';
import ProfileHeader from './ProfileHeader';
import CardDisplay from './displayState/card/CardDisplay';
import ListDisplay from './displayState/list/ListDisplay';
import { useViewDisplayStateStore, ViewDisplayState } from '@/store/useViewDisplayStateStore';

interface ProfileDisplayContainerProps {
  user: User | SearchUser;
  userSneakers: Sneaker[];
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  onSneakerPress: (sneaker: Sneaker) => void;
  onAddSneaker?: () => void;
  showBackButton?: boolean;
}

export default function ProfileDisplayContainer({
  user,
  userSneakers,
  refreshing,
  onRefresh,
  onSneakerPress,
  onAddSneaker,
  showBackButton = false,
}: ProfileDisplayContainerProps) {
  const { viewDisplayState } = useViewDisplayStateStore();
  
  // Calculer sneakersByBrand seulement quand userSneakers change
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

  // Si pas de sneakers, afficher l'état vide
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
        <ProfileHeader 
          user={user} 
          userSneakers={[]} 
          showBackButton={showBackButton}
        />
        <EmptySneakersState 
          onAddPress={onAddSneaker || (() => {})} 
          showAddButton={!!onAddSneaker}
        />
      </ScrollView>
    );
  }

  // Rendu conditionnel pour éviter la récréation des composants
  return (
    <View className="flex-1">
      {viewDisplayState === ViewDisplayState.Card ? (
        <CardDisplay
          sneakersByBrand={sneakersByBrand}
          handleSneakerPress={onSneakerPress}
          refreshing={refreshing}
          onRefresh={onRefresh}
          user={user}
          userSneakers={userSneakers}
          showBackButton={showBackButton}
        />
      ) : (
        <ListDisplay
          userSneakers={userSneakers}
          handleSneakerPress={onSneakerPress}
          refreshing={refreshing}
          onRefresh={onRefresh}
          user={user}
          showBackButton={showBackButton}
        />
      )}
    </View>
  );
} 