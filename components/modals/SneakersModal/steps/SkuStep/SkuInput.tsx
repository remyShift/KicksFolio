import { TextInput, View, Text } from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { useState, forwardRef } from 'react';

interface SkuInputProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    placeholder?: string;
    onFocus?: () => void;
    onBlur?: () => void;
    error?: string;
    nextInputRef?: React.RefObject<TextInput>;
    onSubmitEditing?: () => void;
}

const SkuInput = forwardRef<TextInput, SkuInputProps<any>>(
    ({
        name,
        control,
        placeholder,
        onFocus,
        onBlur,
        error,
        nextInputRef,
        onSubmitEditing,
    }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View className="flex flex-col gap-2 w-full px-12">
            <Controller
                name={name}
                control={control}
                render={({ field: { onChange, onBlur: fieldOnBlur, value } }) => (
                    <TextInput
                        ref={ref}
                        clearButtonMode='while-editing'
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
                        placeholder={placeholder}
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize="none"
                        autoComplete="off"
                        returnKeyType={nextInputRef || onSubmitEditing ? 'next' : 'done'}
                        style={{ height: 40 }}
                        className={`bg-white rounded-md py-3 w-full font-spacemono-bold ${
                            error 
                                ? 'border-2 border-red-500' 
                                : isFocused 
                                    ? 'border-2 border-orange-500' 
                                    : ''
                        }`}
                    />
                )}
            />
            {error && (
                <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>
            )}
        </View>
    );
});

SkuInput.displayName = 'SkuInput';

export default SkuInput; 