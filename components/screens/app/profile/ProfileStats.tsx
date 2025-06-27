import { View, Text } from 'react-native';
import { useSession } from '@/context/authContext';

interface ProfileStatsProps {
    sneakersCount: number;
    friendsCount: number;
}

export default function ProfileStats({ sneakersCount, friendsCount }: ProfileStatsProps) {
    const { userCollection } = useSession();
    return (
        <View className="flex-col w-full gap-5 px-4">
            <View className="flex-row w-full justify-between">
                <View className="bg-primary/20 p-6 rounded-lg w-48">
                    <Text className="font-spacemono text-lg">
                        Sneakers
                    </Text>
                    <Text className="font-spacemono-bold text-2xl" testID='sneakers-count'>
                        {sneakersCount}
                    </Text>
                </View>

                <View className="bg-primary/20 p-6 rounded-lg w-48">
                    <Text className="font-spacemono text-lg">
                        Friends
                    </Text>
                    <Text className="font-spacemono-bold text-2xl">
                        {friendsCount}
                    </Text>
                </View>
            </View>

            <View className="bg-primary/15 p-6 rounded-lg w-full">
                <Text className="font-spacemono text-lg">
                    Value
                </Text>
                <Text className="font-spacemono-bold text-2xl">
                    ${userCollection?.estimated_value || 0}
                </Text>
            </View>
        </View>
    );
} 