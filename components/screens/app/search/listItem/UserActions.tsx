import { SearchUser } from "@/services/UserSearchService";
import { useTranslation } from "react-i18next";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

interface UserActionsProps {
    searchUser: SearchUser;
}

export default function UserActions({ searchUser }: UserActionsProps) {
    const { t } = useTranslation();

    return (
        <View className="items-center">
            {searchUser.is_following && (
                <View className="bg-primary/10 px-2 py-1 rounded-full mb-1">
                    <Text className="font-open-sans-bold text-xs text-primary">
                        {t('social.following')}
                    </Text>
                </View>
            )}
            <Feather name="chevron-right" size={20} color="#666" />
        </View>
    );
} 