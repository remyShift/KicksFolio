import { View, Text } from 'react-native';
import { useSession } from '@/context/authContext';
import { useTranslation } from 'react-i18next';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { Sneaker } from '@/types/Sneaker';

interface ProfileStatsProps {
    sneakersCount: number;
    friendsCount: number;
    sneakers: Sneaker[];
}

export default function ProfileStats({ sneakersCount, friendsCount, sneakers }: ProfileStatsProps) {
    const { t } = useTranslation();
    const totalValue = sneakers?.reduce((acc, sneaker) => acc + (sneaker.estimated_value || 0), 0) || 0;

    const { formattedPrice } = useCurrencyStore();

    return (
        <View className="flex-col w-full gap-5 px-4">
            <View className="flex-row w-full justify-between">
                <View className="bg-primary/20 p-6 rounded-lg w-48">
                    <Text className="font-open-sans text-lg">
                        {t('collection.stats.sneakers')}
                    </Text>
                    <Text className="font-open-sans-bold text-2xl" testID='sneakers-count'>
                        {sneakersCount}
                    </Text>
                </View>

                <View className="bg-primary/20 p-6 rounded-lg w-48">
                    <Text className="font-open-sans text-lg">
                        {t('social.friends.title')}
                    </Text>
                    <Text className="font-open-sans-bold text-2xl">
                        {friendsCount}
                    </Text>
                </View>
            </View>

            <View className="bg-primary/15 p-6 rounded-lg w-full">
                <Text className="font-open-sans text-lg">
                    {t('ui.labels.value')}
                </Text>
                <Text className="font-open-sans-bold text-2xl">
                    {formattedPrice(totalValue)}
                </Text>
            </View>
        </View>
    );
} 