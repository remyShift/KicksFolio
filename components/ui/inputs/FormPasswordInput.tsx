import { TextInput, View, Text, TouchableOpacity } from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { useState, forwardRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import ErrorMsg from '../text/ErrorMsg';

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
        <View className="w-full flex flex-col gap-2">
            <Text className="font-spacemono-bold text-lg">{label}</Text>
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
                            className={`bg-white rounded-md p-3 w-full font-spacemono-bold ${
                            error 
                                ? 'border-red-500' 
                                : isFocused 
                                ? 'border-orange-500' 
                                : 'border-gray-600'
                            }`}
                        />
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute right-4 top-3"
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
            <ErrorMsg content={error || ''} display={error !== ''} />
        </View>
        );
    }
);

FormPasswordInput.displayName = 'FormPasswordInput';

export default FormPasswordInput; 