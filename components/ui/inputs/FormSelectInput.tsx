import { View, Text, Pressable, ScrollView } from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { 
    useAnimatedStyle, 
    withTiming, 
    useSharedValue,
    withSpring 
} from 'react-native-reanimated';

interface Option {
    label: string;
    value: string;
}

interface FormSelectInputProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    placeholder?: string;
    options: Option[];
    onFocus?: () => void;
    error?: string;
    testID?: string;
}

export default function FormSelectInput<T extends FieldValues>({
    name,
    control,
    label,
    placeholder,
    options,
    onFocus,
    error,
    testID,
}: FormSelectInputProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const dropdownHeight = useSharedValue(0);

    const handleOptionSelect = (onChange: (value: string) => void, value: string) => {
        onChange(value);
        dropdownHeight.value = withTiming(0, { duration: 300 });
        setIsOpen(false);
        setIsFocused(false);
    };

    const toggleDropdown = () => {
        if (!isOpen) {
            onFocus?.();
            setIsOpen(true);
            setIsFocused(true);
            dropdownHeight.value = withSpring(200, {
                damping: 15,
                stiffness: 100
            });
        } else {
            dropdownHeight.value = withTiming(0, { duration: 300 });
            setIsOpen(false);
            setIsFocused(false);
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
        <View className="w-[49.5%]">
            {label && <Text className="font-spacemono-bold text-lg">{label}</Text>}
            <Controller
                name={name}
                control={control}
                render={({ field: { onChange, value } }) => {
                    const selectedOption = options.find(option => option.value === value);
                    
                    return (
                        <View className="w-full">
                            <Pressable
                                onPress={toggleDropdown}
                                className={`bg-white p-2 font-spacemono-bold flex-row justify-between items-center
                                    ${isOpen ? 'border-2 border-primary rounded-t-md' : 'rounded-md border-2 border-gray-300'}
                                    ${error ? 'border-2 border-red-500' : ''}
                                    ${isFocused && !isOpen ? 'border-2 border-orange-500' : ''}`}
                                    testID={`${testID}-input`}
                            >
                                <Text className={`font-spacemono-bold-italic text-base ${selectedOption ? 'text-black' : 'text-gray-400'}`}
                                    testID={`${testID}-input-value`}
                                >
                                    {selectedOption ? selectedOption.label.toUpperCase() : (placeholder || label)}
                                </Text>
                                <MaterialIcons 
                                    name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                                    size={24} 
                                    color="black" 
                                />
                            </Pressable>

                            <Animated.View 
                                className={`bg-white rounded-b-md ${isOpen ? 'border-x-2 border-b-2 border-primary' : ''}`}
                                style={animatedStyle}
                            >
                                <ScrollView 
                                    nestedScrollEnabled={true}
                                    className="max-h-64"
                                >
                                    {options.map((option) => (
                                        <Pressable
                                            key={option.value}
                                            className="p-3 border-b border-gray-200"
                                            onPress={() => handleOptionSelect(onChange, option.value)}
                                        >
                                            <Text className="font-spacemono-bold-italic">{option.label.toUpperCase()}</Text>
                                        </Pressable>
                                    ))}
                                </ScrollView>
                            </Animated.View>
                        </View>
                    );
                }}
            />
        </View>
    );
} 