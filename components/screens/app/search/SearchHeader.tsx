import Title from "@/components/ui/text/Title";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import SearchInput from "./SearchInput";
import { useUserSearch } from "@/hooks/useUserSearch";

export default function SearchHeader() {
    const { t } = useTranslation();
    const { searchTerm, setSearchTerm } = useUserSearch();

    return (
        <View className="px-4 mb-4">
            <Title content={t('navigation.navbar.search')} />
            <View className="mt-4">
                <SearchInput
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </View>
        </View>
    );
}