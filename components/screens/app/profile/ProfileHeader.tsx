import { View } from "react-native";
import ProfileInfo from "./ProfileInfo";
import ViewToggleButton from "@/components/ui/buttons/ViewToggleButton";
import { Sneaker } from "@/types/Sneaker";
import { User } from "@/types/User";
import SettingsButton from "./SettingsButton";
import Title from "@/components/ui/text/Title";
import { useTranslation } from "react-i18next";
import { SearchUser } from "@/services/UserSearchService";
import { useSession } from "@/context/authContext";
import BackButton from "@/components/ui/buttons/BackButton";
import { router } from "expo-router";

type ViewMode = 'card' | 'list';

interface ProfileHeaderProps {
  user: User | SearchUser;
  userSneakers: Sneaker[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export default function ProfileHeader({ user, userSneakers, viewMode, setViewMode }: ProfileHeaderProps) {
  const { t } = useTranslation();
  const { user: currentUser } = useSession();
  const isOwnProfile = user.id === currentUser?.id;

  return (
        <View className="gap-8">
            {isOwnProfile ? (
                <SettingsButton />
            ) : (
              <View className="flex-row justify-start items-center">
                <BackButton onPressAction={() => router.canGoBack() ? router.back() : router.push('/(app)/(tabs)/search')} />
              </View>
            )}

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