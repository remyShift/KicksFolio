import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";
import { useSneakerFieldValidation } from "@/components/modals/SneakersModal/hooks/useSneakerFieldValidation";

interface SneakerNameInputProps {
    inputRef: React.RefObject<TextInput>;
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
    initialValue?: string;
}

export default function SneakerNameInput({ 
    inputRef, 
    scrollViewRef, 
    onErrorChange, 
    onValueChange,
    initialValue = ""
}: SneakerNameInputProps) {
    const [isSneakerNameFocused, setIsSneakerNameFocused] = useState(false);
    const [sneakerNameValue, setSneakerNameValue] = useState(initialValue);

    const { errorMsg, isError, validateName, clearErrors } = useSneakerFieldValidation();

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange(sneakerNameValue);
    }, [sneakerNameValue]);

    useEffect(() => {
        setSneakerNameValue(initialValue);
    }, [initialValue]);

    const handleFocus = () => {
        setIsSneakerNameFocused(true);
        clearErrors();
    };

    const handleBlur = () => {
        setIsSneakerNameFocused(false);
        validateName(sneakerNameValue);
    };

    const handleChange = (text: string) => {
        setSneakerNameValue(text);
        clearErrors();
    };

    return (
        <View className='flex flex-col gap-2 w-full justify-center items-center'>
            <Text className='font-spacemono-bold text-lg'>*Sneaker Name</Text>
            <TextInput
                ref={inputRef}
                placeholder="Air Max 1"
                inputMode="text"
                value={sneakerNameValue}
                autoCorrect={false}
                placeholderTextColor="gray"
                clearButtonMode="while-editing"
                returnKeyType="next"
                enablesReturnKeyAutomatically={true}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChangeText={handleChange}
                className={`bg-white rounded-md p-3 w-2/3 font-spacemono-bold ${
                    isError ? 'border-2 border-red-500' : ''
                } ${isSneakerNameFocused ? 'border-2 border-primary' : ''}`}
            />
            {errorMsg !== '' && (
                <Text className='text-red-500 text-xs'>{errorMsg}</Text>
            )}
        </View>
    );
} 