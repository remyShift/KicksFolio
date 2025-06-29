import { View, Text } from 'react-native';
import { useSession } from '@/context/authContext';
import { useTranslation } from 'react-i18next';

interface ProfileStatsProps {
    sneakersCount: number;
    friendsCount: number;
}

export default function ProfileStats({ sneakersCount, friendsCount }: ProfileStatsProps) {
    const { userSneakers } = useSession();
    const { t } = useTranslation();
    const totalValue = userSneakers?.reduce((acc, sneaker) => acc + (sneaker.estimated_value || 0), 0) || 0;
    return (
        <View className="flex-col w-full gap-5 px-4">
            <View className="flex-row w-full justify-between">
                <View className="bg-primary/20 p-6 rounded-lg w-48">
                    <Text className="font-spacemono text-lg">
                        {t('common.titles.sneakers')}
                    </Text>
                    <Text className="font-spacemono-bold text-2xl" testID='sneakers-count'>
                        {sneakersCount}
                    </Text>
                </View>

                <View className="bg-primary/20 p-6 rounded-lg w-48">
                    <Text className="font-spacemono text-lg">
                        {t('common.titles.friends')}
                    </Text>
                    <Text className="font-spacemono-bold text-2xl">
                        {friendsCount}
                    </Text>
                </View>
            </View>

            <View className="bg-primary/15 p-6 rounded-lg w-full">
                <Text className="font-spacemono text-lg">
                    {t('common.titles.value')}
                </Text>
                <Text className="font-spacemono-bold text-2xl">
                    ${totalValue}
                </Text>
            </View>
        </View>
    );
} 