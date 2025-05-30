import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { 
    useAnimatedStyle, 
    withTiming, 
    useSharedValue,
    withSpring 
} from 'react-native-reanimated';

type DropdownInputProps = {
    value: string;
    onSelect: (value: string) => void;
    options: string[];
    placeholder: string;
    isError?: boolean;
    isFocused?: boolean;
    onOpen?: () => void;
    onBlur?: () => void;
};

export default function DropdownInput({ 
    value, 
    onSelect, 
    options, 
    placeholder, 
    isError, 
    onOpen,
    onBlur,
}: DropdownInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownHeight = useSharedValue(0);

    const handleOptionSelect = (option: string) => {
        onSelect(option);
        dropdownHeight.value = withTiming(0, { duration: 300 });
        setIsOpen(false);
        onBlur?.();
    };

    const toggleDropdown = () => {
        if (!isOpen) {
            onOpen?.();
            setIsOpen(true);
            dropdownHeight.value = withSpring(200, {
                damping: 15,
                stiffness: 100
            });
        } else {
            dropdownHeight.value = withTiming(0, { duration: 300 });
            setIsOpen(false);
        }
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            maxHeight: dropdownHeight.value,
            opacity: dropdownHeight.value === 0 ? 0 : 1,
            overflow: 'hidden'
        };
    });

    return (
        <View className='w-full'>
            <Pressable
                className={`bg-white rounded-md p-2 font-spacemono-bold flex-row justify-between items-center
                    ${isOpen ? 'border-2 border-primary' : ''}
                    ${isError ? 'border-2 border-red-500' : ''}`}
                onPress={toggleDropdown}
            >
                <Text className="font-spacemono-bold-italic text-base">
                    {value || placeholder}
                </Text>
                <MaterialIcons 
                    name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={24} 
                    color="black" 
                />
            </Pressable>

            <Animated.View 
                className="relative top-2 w-full bg-white rounded-md shadow-md z-50"
                style={animatedStyle}
            >
                <ScrollView 
                    nestedScrollEnabled={true}
                    className="max-h-48"
                >
                    {options.map((option) => (
                        <Pressable
                            key={option}
                            className="p-3 border-b border-gray-200"
                            onPress={() => handleOptionSelect(option)}
                        >
                            <Text className="font-spacemono-bold-italic">{option}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </Animated.View>
        </View>
    );
}