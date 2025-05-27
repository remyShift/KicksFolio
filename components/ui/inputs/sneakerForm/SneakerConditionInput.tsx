import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";
import { useSneakerFieldValidation } from "@/components/modals/SneakersModal/hooks/useSneakerFieldValidation";

interface SneakerConditionInputProps {
    inputRef: React.RefObject<TextInput>;
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
    initialValue?: string;
}

export default function SneakerConditionInput({ 
    inputRef, 
    scrollViewRef, 
    onErrorChange, 
    onValueChange,
    initialValue = ""
}: SneakerConditionInputProps) {
    const [isSneakerConditionFocused, setIsSneakerConditionFocused] = useState(false);
    const [sneakerConditionValue, setSneakerConditionValue] = useState(initialValue);

    const { errorMsg, isError, validateCondition, clearErrors } = useSneakerFieldValidation();

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange(sneakerConditionValue);
    }, [sneakerConditionValue]);

    useEffect(() => {
        setSneakerConditionValue(initialValue);
    }, [initialValue]);

    const handleFocus = () => {
        setIsSneakerConditionFocused(true);
        clearErrors();
    };

    const handleBlur = () => {
        setIsSneakerConditionFocused(false);
        validateCondition(sneakerConditionValue);
    };

    const handleChange = (text: string) => {
        const formattedText = text.replace(',', '.');
        if (formattedText === '' || !isNaN(Number(formattedText))) {
            setSneakerConditionValue(formattedText);
            clearErrors();
        }
    };

    return (
        <View className='flex-col items-center p-2 gap-1 w-1/3'>
            <Text className='font-spacemono text-center'>*Condition</Text>
            <View className="w-4/5">
                <TextInput
                    ref={inputRef}
                    placeholder="0 - 10"
                    inputMode="decimal"
                    keyboardType="decimal-pad"
                    maxLength={3}
                    autoComplete="off"
                    value={sneakerConditionValue}
                    placeholderTextColor="gray"
                    returnKeyType="done"
                    enablesReturnKeyAutomatically={true}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChangeText={handleChange}
                    className={`bg-white rounded-md p-2 w-full font-spacemono-bold ${
                        isError ? 'border-2 border-red-500' : ''
                    } ${isSneakerConditionFocused ? 'border-2 border-primary' : ''}`}
                />
                {errorMsg !== '' && (
                    <Text className='text-red-500 text-xs text-center mt-1'>{errorMsg}</Text>
                )}
            </View>
        </View>
    );
} 