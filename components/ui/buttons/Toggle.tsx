import { View, Text, Pressable } from 'react-native';
import Animated, { 
    withSpring, 
    useAnimatedStyle 
} from 'react-native-reanimated';

interface ToggleProps {
    leftValue: string;
    rightValue: string;
    currentValue: string;
    onToggle: (newValue: string) => void;
    testID?: string;
    px?: number;
}

export default function Toggle({ 
    leftValue, 
    rightValue, 
    currentValue, 
    onToggle,
    testID,
    px = 4
}: ToggleProps) {
    const isLeftSelected = currentValue === leftValue;

    const animatedStyle = useAnimatedStyle(() => {
        const targetX = isLeftSelected ? 3 : 46;
        return {
            transform: [{ translateX: withSpring(targetX, {
                damping: 20,
                stiffness: 180,
                mass: 0.5,
            }) }],
        };
    }, [isLeftSelected]);

    const handlePress = () => {
        const newValue = isLeftSelected ? rightValue : leftValue;
        onToggle(newValue);
    };

    return (
        <View className="flex-row items-center" testID={testID}>
            <Pressable
                className={`w-24 h-8 rounded-full bg-gray-300 relative flex-row items-center justify-between ${px ? `px-${px}` : 'px-4'}`}
                onPress={handlePress}
            >
                <Text 
                    className={`text-xs font-open-sans-bold z-10 ${isLeftSelected ? 'text-white' : 'text-gray-600'}`}
                >
                    {leftValue.toUpperCase()}
                </Text>
                <Text 
                    className={`text-xs font-open-sans-bold z-10 ${!isLeftSelected ? 'text-white' : 'text-gray-600'}`}
                >
                    {rightValue.toUpperCase()}
                </Text>
                <Animated.View
                    className="w-10 h-7 rounded-full bg-primary absolute top-0.5"
                    style={animatedStyle}
                />
            </Pressable>
        </View>
    );
} 