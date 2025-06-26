import { View } from "react-native";
import ProfileInfo from "./ProfileInfo";
import ViewToggleButton from "@/components/ui/buttons/ViewToggleButton";
import { Sneaker } from "@/types/Sneaker";
import { User } from "@/types/User";
import ProfileUpperHeader from "./ProfileUpperHeader";
import Title from "@/components/ui/text/Title";

type ViewMode = 'card' | 'list';

interface ProfileHeaderProps {
  user: User;
  userSneakers: Sneaker[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onMenuPress: () => void;
}

export default function ProfileHeader({ user, userSneakers, viewMode, setViewMode, onMenuPress }: ProfileHeaderProps) {
  return (
        <View className="gap-8">
            <ProfileUpperHeader onMenuPress={onMenuPress} />
            <ProfileInfo user={user} userSneakers={userSneakers} />
            {userSneakers && userSneakers.length > 0 && (
                <View className="flex-row mb-8 items-center">
                    <Title content="My collection" />
                    <ViewToggleButton 
                      currentMode={viewMode}
                      onToggle={setViewMode}
                    />
                </View>
              )}
        </View>
    );
}