import { View, Text, TouchableOpacity } from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface Option {
    label: string;
    value: string;
}

interface FormSelectInputProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label: string;
    placeholder?: string;
    options: Option[];
    onFocus?: () => void;
    error?: string;
}

export default function FormSelectInput<T extends FieldValues>({
    name,
    control,
    label,
    placeholder,
    options,
    onFocus,
    error,
}: FormSelectInputProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View className="w-full">
            <Text className="font-spacemono-bold text-lg">{label}</Text>
            <Controller
                name={name}
                control={control}
                render={({ field: { onChange, value } }) => {
                const selectedOption = options.find(option => option.value === value);
                
                return (
                    <View className="relative">
                        <TouchableOpacity
                            onPress={() => {
                            setIsOpen(!isOpen);
                            setIsFocused(true);
                            onFocus?.();
                            }}
                            className={`w-full px-4 py-3 rounded-lg border-2 bg-gray-800 flex-row justify-between items-center ${
                            error 
                                ? 'border-red-500' 
                                : isFocused 
                                ? 'border-orange-500' 
                                : 'border-gray-600'
                            }`}
                        >
                            <Text className={`${selectedOption ? 'text-white' : 'text-gray-400'}`}>
                                {selectedOption ? selectedOption.label : (placeholder || label)}
                            </Text>
                            <Ionicons
                                name={isOpen ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color="#9CA3AF"
                            />
                        </TouchableOpacity>

                        {isOpen && (
                            <View className="absolute top-full left-0 right-0 z-10 mt-1 bg-gray-800 border border-gray-600 rounded-lg overflow-hidden">
                                {options.map((option) => (
                                    <TouchableOpacity
                                    key={option.value}
                                    onPress={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                        setIsFocused(false);
                                    }}
                                    className="px-4 py-3 border-b border-gray-700 last:border-b-0"
                                >
                                    <Text className="text-white">{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                            </View>
                        )}
                    </View>
                );
                }}
            />
        </View>
    );
} 