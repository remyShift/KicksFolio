import { useSneakerForm } from "@/components/modals/SneakersModal/hooks/useSneakerForm";
import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";

interface SneakerPricePaidInputProps {
    inputRef: React.RefObject<TextInput>;
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
    nextInputRef: React.RefObject<TextInput>;
    initialValue?: string;
}

export default function SneakerPricePaidInput({ 
    inputRef, 
    scrollViewRef,
    onErrorChange, 
    onValueChange,
    initialValue = "",
    nextInputRef
}: SneakerPricePaidInputProps) {
    const [isSneakerPricePaidError, setIsSneakerPricePaidError] = useState(false);
    const [isSneakerPricePaidFocused, setIsSneakerPricePaidFocused] = useState(false);
    const [sneakerPricePaidValue, setSneakerPricePaidValue] = useState(initialValue);

    const { handleForm, errorMsg } = useSneakerForm({
        errorSetters: {
            sneakerPricePaid: (isError: boolean) => setIsSneakerPricePaidError(isError),
        },
        focusSetters: {
            sneakerPricePaid: (isFocused: boolean) => setIsSneakerPricePaidFocused(isFocused),
        },
        scrollViewRef
    });

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange(sneakerPricePaidValue);
    }, [sneakerPricePaidValue]);

    useEffect(() => {
        setSneakerPricePaidValue(initialValue);
    }, [initialValue]);

    return (
        <View className='flex-col items-center p-2 gap-1 w-1/3 border-r-2 border-gray-300'>
            <Text className='font-spacemono text-center'>Price Paid</Text>
            <View className="w-4/5">
                <TextInput
                    ref={inputRef}
                    placeholder="150$"
                    inputMode="decimal"
                    keyboardType="decimal-pad"
                    autoComplete="off"
                    value={sneakerPricePaidValue}
                    placeholderTextColor="gray"
                    returnKeyType="next"
                    onSubmitEditing={() => {
                        if (nextInputRef) {
                            handleForm.inputBlur('sneakerPricePaid', sneakerPricePaidValue)
                                .then((isValid) => {
                                    if (isValid) {
                                        nextInputRef.current?.focus();
                                    }
                                });
                        }
                    }}
                    enablesReturnKeyAutomatically={true}
                    onFocus={() => handleForm.inputFocus('sneakerPricePaid')}
                    onBlur={() => handleForm.inputBlur('sneakerPricePaid', sneakerPricePaidValue)}
                    onChangeText={(text) => handleForm.inputChange(text, setSneakerPricePaidValue)}
                    className={`bg-white rounded-md p-2 w-full font-spacemono-bold ${
                        isSneakerPricePaidError ? 'border-2 border-red-500' : ''
                    } ${isSneakerPricePaidFocused ? 'border-2 border-primary' : ''}`}
                />
            </View>
        </View>
    );
} 