import { View, Text, Pressable, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface ToggleProps {
    leftValue: string;
    rightValue: string;
    currentValue: string;
    onToggle: (newValue: string) => void;
    testID?: string;
}

export default function Toggle({ 
    leftValue, 
    rightValue, 
    currentValue, 
    onToggle,
    testID 
}: ToggleProps) {
    const isLeftSelected = currentValue === leftValue;
    const translateX = useRef(new Animated.Value(isLeftSelected ? 4 : 46)).current;

    useEffect(() => {
        Animated.spring(translateX, {
            toValue: isLeftSelected ? 4 : 42,
            useNativeDriver: true,
            damping: 20,
            stiffness: 180,
            mass: 0.5,
        }).start();
    }, [currentValue, isLeftSelected]);

    const handlePress = () => {
        const newValue = isLeftSelected ? rightValue : leftValue;
        onToggle(newValue);
    };

    return (
        <View className="flex-row items-center" testID={testID}>
            <Pressable
                className="w-[80px] h-8 rounded-full bg-gray-300 relative flex-row items-center justify-between px-4"
                onPress={handlePress}
            >
                <Text 
                    className={`text-xs font-spacemono-bold z-10 ${isLeftSelected ? 'text-white' : 'text-gray-600'}`}
                >
                    {leftValue.toUpperCase()}
                </Text>
                <Text 
                    className={`text-xs font-spacemono-bold z-10 ${!isLeftSelected ? 'text-white' : 'text-gray-600'}`}
                >
                    {rightValue.toUpperCase()}
                </Text>
                <Animated.View
                    className="w-10 h-7 rounded-full bg-primary absolute top-0.5"
                    style={{
                        transform: [{ translateX }],
                    }}
                />
            </Pressable>
        </View>
    );
} 