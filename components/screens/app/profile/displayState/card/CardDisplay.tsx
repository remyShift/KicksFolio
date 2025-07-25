import React from 'react'
import { RefreshControl, ScrollView, View } from 'react-native'
import ProfileHeader from '../../ProfileHeader'
import SneakersCardByBrand from './SneakersCardByBrand'
import { ViewMode } from '@/types/Sneaker';
import { Sneaker } from '@/types/Sneaker';
import { User } from '@/types/User';
import { SearchUser } from '@/services/UserSearchService';

interface CardDisplayProps {
    user: User | SearchUser;
    userSneakers: Sneaker[];
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    sneakersByBrand: Record<string, Sneaker[]>;
    handleSneakerPress: (sneaker: Sneaker) => void;
    refreshing: boolean;
    onRefresh: () => Promise<void>;
    showBackButton?: boolean;
    onBackPress?: () => void;
}

export default function CardDisplay({ 
    user, 
    userSneakers, 
    viewMode, 
    setViewMode, 
    sneakersByBrand, 
    handleSneakerPress, 
    refreshing, 
    onRefresh,
    showBackButton = false,
    onBackPress
}: CardDisplayProps) {
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
            <View className="gap-10">
                <ProfileHeader 
                    user={user} 
                    userSneakers={userSneakers} 
                    viewMode={viewMode} 
                    setViewMode={setViewMode}
                    showBackButton={showBackButton}
                    onBackPress={onBackPress}
                />
                <SneakersCardByBrand
                    sneakersByBrand={sneakersByBrand}
                    onSneakerPress={handleSneakerPress}
                />
            </View>
        </ScrollView>
    )
}
