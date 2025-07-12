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
    
    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isOpen ? 1 : 0, { duration: 300 }),
            transform: [
                {
                    translateY: withTiming(isOpen ? 0 : -50, { duration: 300 })
                }
            ]
        };
    }, [isOpen]);

    const handleOptionSelect = (onChange: (value: string) => void, value: string) => {
        onChange(value);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        if (!isOpen) {
            onFocus?.();
        }
        setIsOpen(!isOpen);
    };

    return (
        <View className="w-[49.5%] relative" style={{ zIndex: isOpen ? 99999 : 1 }}>
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
                                `}
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
                                className="absolute top-full left-0 right-0 bg-white rounded-b-md border-x-2 border-b-2 border-primary shadow-2xl"
                                style={[animatedStyle, { 
                                    maxHeight: 200,
                                    zIndex: 99999,
                                    elevation: 20
                                }]}
                                pointerEvents={isOpen ? 'auto' : 'none'}
                            >
                                <ScrollView 
                                    nestedScrollEnabled={true}
                                    className="max-h-48"
                                    showsVerticalScrollIndicator={true}
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