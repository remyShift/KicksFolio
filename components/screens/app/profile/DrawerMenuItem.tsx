import { Pressable, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DrawerMenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    color?: string;
    textColor?: string;
}

export default function DrawerMenuItem({ 
    icon, 
    label, 
    onPress, 
    color = '#666',
    textColor
}: DrawerMenuItemProps) {
    return (
        <Pressable onPress={onPress}>
            <View className="flex-row items-center gap-4">
                <Ionicons name={icon} size={24} color={color} />
                <Text className="font-spacemono-bold text-base" style={{ color: textColor }}>
                    {label}
                </Text>
            </View>
        </Pressable>
    );
} 