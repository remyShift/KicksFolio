import { View } from "react-native";
import ProfileInfo from "./ProfileInfo";
import ViewToggleButton from "@/components/ui/buttons/ViewToggleButton";
import { Sneaker } from "@/types/Sneaker";
import { User } from "@/types/User";
import SettingsButton from "./SettingsButton";
import Title from "@/components/ui/text/Title";
import { useTranslation } from "react-i18next";
import { SearchUser } from "@/services/UserSearchService";

type ViewMode = 'card' | 'list';

interface ProfileHeaderProps {
  user: User | SearchUser;
  userSneakers: Sneaker[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onMenuPress: () => void;
}

export default function ProfileHeader({ user, userSneakers, viewMode, setViewMode, onMenuPress }: ProfileHeaderProps) {
  const { t } = useTranslation();
  return (
        <View className="gap-8">
            <SettingsButton onMenuPress={onMenuPress} />
            <ProfileInfo user={user} userSneakers={userSneakers} />
            {userSneakers && userSneakers.length > 0 && (
                <View className="flex-row mb-8 items-center">
                    <Title content={t('collection.pages.titles.collection')} />
                    <ViewToggleButton 
                      currentMode={viewMode}
                      onToggle={setViewMode}
                    />
                </View>
              )}
        </View>
    );
}