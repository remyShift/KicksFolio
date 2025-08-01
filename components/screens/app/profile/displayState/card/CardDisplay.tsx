import { RefreshControl, ScrollView } from 'react-native'
import SneakersCardByBrand from './SneakersCardByBrand'
import { Sneaker } from '@/types/Sneaker';
import { User } from '@/types/User';
import { SearchUser } from '@/domain/UserSearchService';
import ProfileHeader from '../../ProfileHeader';

interface CardDisplayProps {
    sneakersByBrand: Record<string, Sneaker[]>;
    handleSneakerPress: (sneaker: Sneaker) => void;
    refreshing: boolean;
    onRefresh: () => Promise<void>;
    user: User | SearchUser;
    userSneakers: Sneaker[];
    showBackButton?: boolean;
}

export default function CardDisplay({ 
    sneakersByBrand, 
    handleSneakerPress, 
    refreshing, 
    onRefresh,
    user,
    userSneakers,
    showBackButton,
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
            <ProfileHeader user={user} userSneakers={userSneakers} showBackButton={showBackButton} />
            <SneakersCardByBrand
                sneakersByBrand={sneakersByBrand}
                onSneakerPress={handleSneakerPress}
            />
        </ScrollView>
    )
}
