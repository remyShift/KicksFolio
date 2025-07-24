import { View, Text } from 'react-native';
import { useSession } from '@/context/authContext';
import { useTranslation } from 'react-i18next';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { Sneaker } from '@/types/Sneaker';

interface ProfileStatsProps {
    sneakersCount: number;
    followersCount: number;
    sneakers: Sneaker[];
    followingCount: number;
}

export default function ProfileStats({ sneakersCount, followersCount, sneakers, followingCount }: ProfileStatsProps) {
    const { t } = useTranslation();
    const totalValue = sneakers?.reduce((acc, sneaker) => acc + (sneaker.estimated_value || 0), 0) || 0;

    const { formattedPrice } = useCurrencyStore();

    return (
        <View className="flex gap-2 justify-center">
            <View className="flex-row gap-2">
                <View className="bg-primary/15 p-3 rounded-lg">
                    <Text className="font-open-sans text-base">
                        {t('collection.stats.sneakers')}
                    </Text>
                    <Text className="font-open-sans-bold text-xl" testID='sneakers-count'>
                        {sneakersCount}
                    </Text>
                </View>

                <View className="bg-primary/15 p-3 rounded-lg">
                    <Text className="font-open-sans text-base">
                        {t('social.followers')}
                    </Text>
                    <Text className="font-open-sans-bold text-xl">
                        {followersCount}
                    </Text>
                </View>

                <View className="bg-primary/15 p-3 rounded-lg">
                    <Text className="font-open-sans text-base">
                        {t('social.following')}
                    </Text>
                    <Text className="font-open-sans-bold text-xl">
                        {followingCount}
                    </Text>
                </View>
            </View>

            <View className="bg-primary/15 p-3 rounded-lg">
                <Text className="font-open-sans text-base">
                    {t('ui.labels.value')}
                </Text>
                <Text className="font-open-sans-bold text-xl">
                    {formattedPrice(totalValue)}
                </Text>
            </View>

        </View>
    );
} 