import { View, Text } from 'react-native';

interface ProfileStatsProps {
    sneakersCount: number;
    friendsCount: number;
    totalValue: number;
}

export default function ProfileStats({ sneakersCount, friendsCount, totalValue }: ProfileStatsProps) {
    return (
        <View className="flex-row w-full gap-10">
            <View>
                <Text className="font-spacemono-bold text-lg text-center" testID='sneakers-count'>
                    {sneakersCount}
                </Text>
                <Text className="font-spacemono text-base text-center">
                    sneakers
                </Text>
            </View>

            <View>
                <Text className="font-spacemono-bold text-lg text-center">
                    {friendsCount}
                </Text>
                <Text className="font-spacemono text-base text-center">
                    friends
                </Text>
            </View>

            <View>
                <Text className="font-spacemono-bold text-lg text-center">
                    ${totalValue}
                </Text>
                <Text className="font-spacemono text-base text-center">
                    value
                </Text>
            </View>
        </View>
    );
} 