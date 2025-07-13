import { View } from "react-native";
import ViewToggleButton from "@/components/ui/buttons/ViewToggleButton";
import { Sneaker } from "@/types/Sneaker";
import Title from "@/components/ui/text/Title";
import { useTranslation } from "react-i18next";

type ViewMode = 'card' | 'list';

interface WishlistHeaderProps {
    wishlistSneakers: Sneaker[];
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
}

export default function WishlistHeader({ wishlistSneakers, viewMode, setViewMode }: WishlistHeaderProps) {
    const { t } = useTranslation();

    return (
        <View className="gap-8 pt-32">
        {wishlistSneakers && wishlistSneakers.length > 0 && (
            <View className="flex-row mb-8 items-center">
            <Title content={t('collection.pages.titles.wishlist')} />
            <ViewToggleButton 
                currentMode={viewMode}
                onToggle={setViewMode}
            />
            </View>
        )}
        </View>
    );
} 