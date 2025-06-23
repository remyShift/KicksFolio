import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PageTitle from '@/components/ui/text/PageTitle';

interface ProfileUpperHeaderProps {
    onMenuPress: () => void;
}

export default function ProfileUpperHeader({ onMenuPress }: ProfileUpperHeaderProps) {
    return (
        <View className="flex-row justify-center items-center" testID="profile-header">
            <PageTitle content="Profile" />
            <Pressable 
                className="p-4 absolute right-0 mt-2 top-10 z-50"
                onPress={onMenuPress}
                testID="menu-button"
            >
                <Ionicons name="menu-outline" size={24} color="#666" />
            </Pressable>
        </View>
    );
} 