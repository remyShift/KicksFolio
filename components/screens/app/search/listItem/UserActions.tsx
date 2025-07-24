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
            <Feather name="chevron-right" size={20} color="#666" />
        </View>
    );
} 