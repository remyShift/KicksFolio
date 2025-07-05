import { TextInput, View, Text } from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { useState, forwardRef, RefObject } from 'react';
import { useInputSubmit } from '@/hooks/useInputSubmit';

interface FormTextInputProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    placeholder?: string;
    onFocus?: () => void;
    onBlur?: (value: string) => Promise<void>;
    onAsyncValidation?: (value: string) => Promise<void>;
    onSubmitEditing?: () => void;
    error?: string;
    getFieldError: (fieldName: string) => string | undefined;
    nextInputRef?: RefObject<TextInput | null>;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoComplete?: 'email' | 'username' | 'name' | 'off';
    maxLength?: number;
    multiline?: boolean;
    scrollEnabled?: boolean;
    textAlignVertical?: 'top' | 'center' | 'bottom';
    accessibilityLabel?: string;
    testID?: string;
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
        getFieldError,
        nextInputRef,
        keyboardType = 'default',
        autoCapitalize = 'none',
        autoComplete = 'off',
        maxLength,
        multiline = false,
        scrollEnabled = false,
        textAlignVertical = 'center',
        accessibilityLabel,
        testID,
    }, ref) => {

    const [isFocused, setIsFocused] = useState(false);

    const textInputHeight = multiline ? 135 : 40;

    return (
        <View className="flex flex-col gap-2 w-full">
            {label && <Text className="font-spacemono-bold text-lg">{label}</Text>}
            <Controller
                name={name}
                control={control}
                render={({ field: { onChange, value } }) => {
                    const { handleSubmitEditing } = useInputSubmit({
                        ref,
                        fieldName: name,
                        getFieldError: getFieldError || (() => undefined),
                        nextInputRef,
                        onSubmitEditing,
                        setIsFocused,
                        onBlur,
                        value,
                    });

                    return (
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
                            onSubmitEditing={handleSubmitEditing}
                            placeholder={placeholder || label}
                            placeholderTextColor="#9CA3AF"
                            keyboardType={keyboardType}
                            autoCapitalize={autoCapitalize}
                            autoComplete={autoComplete}
                            maxLength={maxLength}
                            returnKeyType={onSubmitEditing ? 'done' : 'next'}
                            multiline={multiline}
                            scrollEnabled={scrollEnabled}
                            textAlignVertical={textAlignVertical}
                            style={{ height: textInputHeight }}
                            accessibilityLabel={accessibilityLabel || label}
                            className={`bg-white rounded-md py-3 px-2 w-full font-spacemono-bold ${
                                error 
                                ? 'border-2 border-red-500' 
                                : isFocused 
                                    ? 'border-2 border-orange-500' 
                                    : ''
                            }`}
                            testID={`${testID}-input`}
                        />
                    );
                }}
            />
        </View>
    );
});

FormTextInput.displayName = 'FormTextInput';

export default FormTextInput; 