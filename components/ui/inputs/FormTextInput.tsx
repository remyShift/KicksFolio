import { TextInput, View, Text } from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { useState, forwardRef } from 'react';

interface FormTextInputProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label: string;
    placeholder?: string;
    onFocus?: () => void;
    onBlur?: () => void;
    onAsyncValidation?: (value: string) => Promise<void>;
    onSubmitEditing?: () => void;
    error?: string;
    nextInputRef?: React.RefObject<TextInput>;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoComplete?: 'email' | 'username' | 'name' | 'off';
    maxLength?: number;
}

const FormTextInput = forwardRef<TextInput, FormTextInputProps<any>>(
    ({
        name,
        control,
        label,
        placeholder,
        onFocus,
        onBlur,
        onAsyncValidation,
        onSubmitEditing,
        error,
        nextInputRef,
        keyboardType = 'default',
        autoCapitalize = 'none',
        autoComplete = 'off',
        maxLength,
    }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View className="w-full">
            <Text className="text-white text-base font-medium mb-2">{label}</Text>
            <Controller
            name={name}
            control={control}
            render={({ field: { onChange, onBlur: fieldOnBlur, value } }) => (
                <TextInput
                    ref={ref}
                    value={value || ''}
                    onChangeText={onChange}
                    onFocus={() => {
                        setIsFocused(true);
                        onFocus?.();
                    }}
                    onBlur={async () => {
                        setIsFocused(false);
                        fieldOnBlur();
                        onBlur?.();
                        
                        if (onAsyncValidation && value) {
                        await onAsyncValidation(value);
                        }
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
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    autoComplete={autoComplete}
                    maxLength={maxLength}
                    returnKeyType={nextInputRef ? 'next' : 'done'}
                    className={`w-full px-4 py-3 rounded-lg border-2 text-white bg-gray-800 ${
                        error 
                        ? 'border-red-500' 
                        : isFocused 
                            ? 'border-orange-500' 
                            : 'border-gray-600'
                    }`}
                />
            )}
            />
            {error && (
                <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>
            )}
        </View>
        );
    }
);

FormTextInput.displayName = 'FormTextInput';

export default FormTextInput; 