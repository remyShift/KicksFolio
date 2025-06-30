import { View, Text, Pressable, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { SizeUnit } from '@/store/useSizeUnitStore';

interface SizeUnitToggleProps {
    onToggle: (newUnit: SizeUnit) => void;
    currentUnit: SizeUnit;
}

export default function SizeUnitToggle({ onToggle, currentUnit }: SizeUnitToggleProps) {
    const translateX = useRef(new Animated.Value(currentUnit === 'US' ? 0 : 28)).current;

    useEffect(() => {
        Animated.spring(translateX, {
            toValue: currentUnit === 'US' ? 4 : 28,
            useNativeDriver: true,
            damping: 15,
            stiffness: 120,
        }).start();
    }, [currentUnit]);

    return (
        <View className="flex-row items-center gap-4">
            <Pressable
                className="w-[56px] h-7 rounded-full bg-gray-300 relative"
                onPress={() => onToggle(currentUnit === 'US' ? 'EU' : 'US')}
            >
                <Animated.View
                    className="w-6 h-6 rounded-full bg-primary absolute top-0.5 left-0.5"
                    style={{
                        transform: [{ translateX }],
                    }}
                />
            </Pressable>
            <Text className="font-spacemono-bold">
                {currentUnit}
            </Text>
        </View>
    );
} 