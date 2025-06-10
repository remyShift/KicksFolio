import { TextInput, View, Text } from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { useState, forwardRef } from 'react';

interface FormTextInputProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label: string;
    placeholder?: string;
    onFocus?: () => void;
    onBlur?: (value: string) => Promise<void>;
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
        <View className="flex flex-col gap-2 w-full">
            <Text className="font-spacemono-bold text-lg">{label}</Text>
            <Controller
                name={name}
                control={control}
                render={({ field: { onChange, value } }) => (
                    <TextInput
                        ref={ref}
                        clearButtonMode='while-editing'
                        value={value || ''}
                        onChangeText={onChange}
                        onFocus={() => {
                            setIsFocused(true);
                            onFocus?.();
                        }}
                        onBlur={async () => {
                            setIsFocused(false);
                            
                            if (onBlur && value && value.toString().trim() !== '') {
                                await onBlur(value);
                            }
                            
                            if (onAsyncValidation && value && value.toString().trim() !== '') {
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
                        className={`bg-white rounded-md p-3 w-full font-spacemono-bold ${
                            error 
                            ? 'border-2 border-red-500' 
                            : isFocused 
                                ? 'border-2 border-orange-500' 
                                : ''
                        }`}
                    />
                )}
            />
        </View>
        );
    }
);

FormTextInput.displayName = 'FormTextInput';

export default FormTextInput; 