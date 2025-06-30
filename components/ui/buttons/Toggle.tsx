import { View, Text, Pressable, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface ToggleProps {
    leftValue: string;
    rightValue: string;
    currentValue: string;
    onToggle: (newValue: string) => void;
    displayValue?: string;
    testID?: string;
}

export default function Toggle({ 
    leftValue, 
    rightValue, 
    currentValue, 
    onToggle, 
    displayValue,
    testID 
}: ToggleProps) {
    const isLeftSelected = currentValue === leftValue;
    const translateX = useRef(new Animated.Value(isLeftSelected ? 0 : 28)).current;

    useEffect(() => {
        Animated.spring(translateX, {
            toValue: isLeftSelected ? 4 : 28,
            useNativeDriver: true,
            damping: 15,
            stiffness: 120,
        }).start();
    }, [currentValue, isLeftSelected]);

    const handlePress = () => {
        const newValue = isLeftSelected ? rightValue : leftValue;
        onToggle(newValue);
    };

    return (
        <View className="flex-row items-center gap-4" testID={testID}>
            <Pressable
                className="w-[56px] h-7 rounded-full bg-gray-300 relative"
                onPress={handlePress}
            >
                <Animated.View
                    className="w-6 h-6 rounded-full bg-primary absolute top-0.5 left-0.5"
                    style={{
                        transform: [{ translateX }],
                    }}
                />
            </Pressable>
            <Text className="font-spacemono-bold">
                {displayValue || currentValue}
            </Text>
        </View>
    );
} 