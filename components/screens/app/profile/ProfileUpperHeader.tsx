import { View, Pressable } from 'react-native';
import { Feather, Ionicons, SimpleLineIcons } from '@expo/vector-icons';
import PageTitle from '@/components/ui/text/PageTitle';

interface ProfileUpperHeaderProps {
    onMenuPress: () => void;
}

export default function ProfileUpperHeader({ onMenuPress }: ProfileUpperHeaderProps) {
    return (
        <View className="flex-row justify-center items-center" testID="profile-header">
            <Pressable 
                className="p-4 absolute right-0 mt-2 -top-8 z-50"
                onPress={onMenuPress}
                testID="menu-button"
            >
                <SimpleLineIcons name="settings" size={24} color="black" />
            </Pressable>
        </View>
    );
} 