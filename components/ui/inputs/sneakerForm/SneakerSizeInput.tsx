import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";
import { useSneakerFieldValidation } from "@/components/modals/SneakersModal/hooks/useSneakerFieldValidation";

interface SneakerSizeInputProps {
    inputRef: React.RefObject<TextInput>;
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
    initialValue?: string;
}

export default function SneakerSizeInput({ 
    inputRef, 
    onErrorChange, 
    onValueChange,
    initialValue = ""
}: SneakerSizeInputProps) {
    const [isSneakerSizeFocused, setIsSneakerSizeFocused] = useState(false);
    const [sneakerSizeValue, setSneakerSizeValue] = useState(initialValue);

    const { errorMsg, isError, validateSize, clearErrors } = useSneakerFieldValidation();

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange(sneakerSizeValue);
    }, [sneakerSizeValue]);

    useEffect(() => {
        setSneakerSizeValue(initialValue);
    }, [initialValue]);

    const handleFocus = () => {
        setIsSneakerSizeFocused(true);
        clearErrors();
    };

    const handleBlur = () => {
        setIsSneakerSizeFocused(false);
        validateSize(sneakerSizeValue);
    };

    const handleChange = (text: string) => {
        const formattedText = text.replace(',', '.');
        if (formattedText === '' || !isNaN(Number(formattedText))) {
            setSneakerSizeValue(formattedText);
            clearErrors();
        }
    };

    return (
        <View className='flex-col items-center p-2 gap-1 w-1/3 border-r-2 border-gray-300'>
            <Text className='font-spacemono text-center'>*Size (US)</Text>
            <View className="w-4/5">
                <TextInput
                    ref={inputRef}
                    placeholder="9.5"
                    inputMode="decimal"
                    keyboardType="decimal-pad"
                    maxLength={4}
                    autoComplete="off"
                    value={sneakerSizeValue}
                    placeholderTextColor="gray"
                    returnKeyType="next"
                    enablesReturnKeyAutomatically={true}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChangeText={handleChange}
                    className={`bg-white rounded-md p-2 w-full font-spacemono-bold ${
                        isError ? 'border-2 border-red-500' : ''
                    } ${isSneakerSizeFocused ? 'border-2 border-primary' : ''}`}
                />
            </View>
        </View>
    );
} 