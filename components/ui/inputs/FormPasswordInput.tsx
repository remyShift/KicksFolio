import { TextInput, View, Text, TouchableOpacity } from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { useState, forwardRef } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface FormPasswordInputProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label: string;
    placeholder?: string;
    onFocus?: () => void;
    onBlur?: () => void;
    error?: string;
    nextInputRef?: React.RefObject<TextInput>;
    onSubmitEditing?: () => void;
    }

const FormPasswordInput = forwardRef<TextInput, FormPasswordInputProps<any>>(
    ({
        name,
        control,
        label,
        placeholder,
        onFocus,
        onBlur,
        error,
        nextInputRef,
        onSubmitEditing,
    }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <View className="w-full">
            <Text className="text-white text-base font-medium mb-2">{label}</Text>
            <Controller
            name={name}
            control={control}
            render={({ field: { onChange, onBlur: fieldOnBlur, value } }) => (
                <View className="relative">
                <TextInput
                    ref={ref}
                    value={value || ''}
                    onChangeText={onChange}
                    onFocus={() => {
                    setIsFocused(true);
                    onFocus?.();
                    }}
                    onBlur={() => {
                    setIsFocused(false);
                    fieldOnBlur();
                    onBlur?.();
                    }}
                    onSubmitEditing={() => {
                    if (onSubmitEditing) {
                        onSubmitEditing();
                    } else {
                        nextInputRef?.current?.focus();
                    }
                    }}
                    placeholder={placeholder || label}
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!isPasswordVisible}
                    autoCapitalize="none"
                    autoComplete="password"
                    returnKeyType={nextInputRef || onSubmitEditing ? 'next' : 'done'}
                    className={`w-full px-4 py-3 pr-12 rounded-lg border-2 text-white bg-gray-800 ${
                    error 
                        ? 'border-red-500' 
                        : isFocused 
                        ? 'border-orange-500' 
                        : 'border-gray-600'
                    }`}
                />
                <TouchableOpacity
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="absolute right-3 top-3"
                >
                    <Ionicons
                    name={isPasswordVisible ? 'eye-off' : 'eye'}
                    size={24}
                    color="#9CA3AF"
                    />
                </TouchableOpacity>
                </View>
            )}
            />
            {error && (
            <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>
            )}
        </View>
        );
    }
);

FormPasswordInput.displayName = 'FormPasswordInput';

export default FormPasswordInput; 