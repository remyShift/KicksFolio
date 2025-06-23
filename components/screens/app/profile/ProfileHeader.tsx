import { View } from "react-native";
import ProfileInfo from "./ProfileInfo";
import ViewToggleButton from "@/components/ui/buttons/ViewToggleButton";
import { useState } from "react";
import { Sneaker } from "@/types/Sneaker";
import { User } from "@/types/User";
import ProfileUpperHeader from "./ProfileUpperHeader";

type ViewMode = 'card' | 'list';

interface ProfileHeaderProps {
  user: User;
  userSneakers: Sneaker[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export default function ProfileHeader({ user, userSneakers, viewMode, setViewMode }: ProfileHeaderProps) {
  const [drawerVisible, setDrawerVisible] = useState(false);
  return (
        <View className="gap-8">
            <ProfileUpperHeader onMenuPress={() => setDrawerVisible(true)} />
            <ProfileInfo user={user} userSneakers={userSneakers} />
            {userSneakers && userSneakers.length > 0 && (
                <View className="flex-row justify-between items-center px-4">
                    <ViewToggleButton 
                      currentMode={viewMode}
                      onToggle={setViewMode}
                    />
                </View>
              )}
        </View>
    );
}