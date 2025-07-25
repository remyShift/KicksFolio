import { RefreshControl, ScrollView, View } from 'react-native';
import SneakersListView from './SneakersListView'
import { User } from '@/types/User'
import { Sneaker } from '@/types/Sneaker'
import { ViewMode } from '@/types/Sneaker'
import ProfileHeader from '../../ProfileHeader'
import { SearchUser } from '@/services/UserSearchService'

interface ListDisplayProps {
    user: User | SearchUser ;
    userSneakers: Sneaker[];
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    handleSneakerPress: (sneaker: Sneaker) => void;
    refreshing: boolean;
    onRefresh: () => Promise<void>;
    showBackButton?: boolean;
    onBackPress?: () => void;
}

export default function ListDisplay({ 
    user, 
    userSneakers, 
    viewMode, 
    setViewMode, 
    handleSneakerPress, 
    refreshing, 
    onRefresh,
    showBackButton = false,
    onBackPress
}: ListDisplayProps) {
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
            <View className="gap-8">
                <ProfileHeader 
                    user={user} 
                    userSneakers={userSneakers} 
                    viewMode={viewMode} 
                    setViewMode={setViewMode}
                    showBackButton={showBackButton}
                    onBackPress={onBackPress}
                />
                <SneakersListView 
                    sneakers={userSneakers}
                    onSneakerPress={handleSneakerPress}
                    scrollEnabled={false}
                />
            </View>
        </ScrollView>
    )
}
