import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";
import { useSneakerFieldValidation } from "@/components/modals/SneakersModal/hooks/useSneakerFieldValidation";

interface SneakerPricePaidInputProps {
    inputRef: React.RefObject<TextInput>;
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
    initialValue?: string;
}

export default function SneakerPricePaidInput({ 
    inputRef, 
    scrollViewRef, 
    onErrorChange, 
    onValueChange,
    initialValue = ""
}: SneakerPricePaidInputProps) {
    const [isSneakerPricePaidFocused, setIsSneakerPricePaidFocused] = useState(false);
    const [sneakerPricePaidValue, setSneakerPricePaidValue] = useState(initialValue);

    const { errorMsg, isError, validatePrice, clearErrors } = useSneakerFieldValidation();

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange(sneakerPricePaidValue);
    }, [sneakerPricePaidValue]);

    useEffect(() => {
        setSneakerPricePaidValue(initialValue);
    }, [initialValue]);

    const handleFocus = () => {
        setIsSneakerPricePaidFocused(true);
        clearErrors();
    };

    const handleBlur = () => {
        setIsSneakerPricePaidFocused(false);
        validatePrice(sneakerPricePaidValue);
    };

    const handleChange = (text: string) => {
        const formattedText = text.replace(',', '.');
        if (formattedText === '' || !isNaN(Number(formattedText))) {
            setSneakerPricePaidValue(formattedText);
            clearErrors();
        }
    };

    return (
        <View className='flex-col items-center p-2 gap-1 w-1/3 border-r-2 border-gray-300'>
            <Text className='font-spacemono text-center'>Price Paid</Text>
            <View className="w-4/5">
                <TextInput
                    ref={inputRef}
                    placeholder="150"
                    inputMode="decimal"
                    keyboardType="decimal-pad"
                    autoComplete="off"
                    value={sneakerPricePaidValue}
                    placeholderTextColor="gray"
                    returnKeyType="next"
                    enablesReturnKeyAutomatically={true}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChangeText={handleChange}
                    className={`bg-white rounded-md p-2 w-full font-spacemono-bold ${
                        isError ? 'border-2 border-red-500' : ''
                    } ${isSneakerPricePaidFocused ? 'border-2 border-primary' : ''}`}
                />
                {errorMsg !== '' && (
                    <Text className='text-red-500 text-xs text-center mt-1'>{errorMsg}</Text>
                )}
            </View>
        </View>
    );
} 