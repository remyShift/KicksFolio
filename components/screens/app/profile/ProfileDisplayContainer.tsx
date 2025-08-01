import { RefreshControl, ScrollView } from 'react-native';
import { Sneaker } from '@/types/Sneaker';
import { User } from '@/types/User';
import { SearchUser } from '@/domain/UserSearchService';
import EmptySneakersState from './displayState/EmptySneakersState';
import ProfileHeader from './ProfileHeader';
import DualViewContainer from './DualViewContainer';

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

  return (
    <DualViewContainer
      user={user}
      userSneakers={userSneakers}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onSneakerPress={onSneakerPress}
      showBackButton={showBackButton}
    />
  );
} 