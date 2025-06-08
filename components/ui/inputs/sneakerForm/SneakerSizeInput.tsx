import { useSneakerForm } from "@/components/modals/SneakersModal/hooks/useSneakerForm";
import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";
import { useFormErrors } from "@/context/formErrorsContext";

interface SneakerSizeInputProps {
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
    initialValue?: string;
    isError?: boolean;
}

export default function SneakerSizeInput({ 
    scrollViewRef,
    onErrorChange, 
    onValueChange,
    initialValue = "",
    isError = false,
}: SneakerSizeInputProps) {
    const [isSneakerSizeError, setIsSneakerSizeError] = useState(false);
    const [isSneakerSizeFocused, setIsSneakerSizeFocused] = useState(false);
    const [sneakerSizeValue, setSneakerSizeValue] = useState(initialValue);
    const { clearErrors } = useFormErrors();
    const { handleForm, errorMsg } = useSneakerForm({

        errorSetters: {
            sneakerSize: (isError: boolean) => setIsSneakerSizeError(isError),
        },
        focusSetters: {
            sneakerSize: (isFocused: boolean) => setIsSneakerSizeFocused(isFocused),
        },
        scrollViewRef
    });

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange(sneakerSizeValue);
    }, [sneakerSizeValue]);

    useEffect(() => {
        setSneakerSizeValue(initialValue);
    }, [initialValue]);

    return (
        <View className='flex-col items-center p-2 gap-1 w-1/3 border-r-2 border-gray-300'>
            <Text className='font-spacemono text-center'>*Size (US)</Text>
            <View className="w-4/5">
                <TextInput
                    placeholder="9.5"
                    inputMode="decimal"
                    keyboardType="decimal-pad"
                    maxLength={4}
                    autoComplete="off"
                    value={sneakerSizeValue}
                    placeholderTextColor="gray"
                    returnKeyType="next"
                    enablesReturnKeyAutomatically={true}
                    onFocus={() => {
                        handleForm.inputFocus('sneakerSize');
                        clearErrors();
                    }}
                    onBlur={() => handleForm.inputBlur('sneakerSize', sneakerSizeValue)}
                    onChangeText={(text) => handleForm.inputChange(text, setSneakerSizeValue)}
                    className={`bg-white rounded-md p-2 w-full font-spacemono-bold ${
                        (isSneakerSizeError || isError) ? 'border-2 border-red-500' : ''
                    } ${isSneakerSizeFocused ? 'border-2 border-primary' : ''}`}
                />
            </View>
        </View>
    );
} 