import { useEffect, useState } from "react";
import { Text, TextInput, View, ScrollView } from "react-native";
import { useSneakerForm } from "@/components/modals/SneakersModal/hooks/useSneakerForm";
import { useFormErrors } from "@/context/formErrorsContext";

interface SneakerConditionInputProps {
    scrollViewRef: React.RefObject<ScrollView>;
    onErrorChange: (errorMsg: string) => void;
    onValueChange: (value: string) => void;
    initialValue?: string;
    isError?: boolean;
}

export default function SneakerConditionInput({ 
    onErrorChange, 
    onValueChange,
    initialValue = "",
    scrollViewRef,
    isError = false
}: SneakerConditionInputProps) {
    const [isSneakerConditionError, setIsSneakerConditionError] = useState(false);
    const [isSneakerConditionFocused, setIsSneakerConditionFocused] = useState(false);
    const [sneakerConditionValue, setSneakerConditionValue] = useState(initialValue);
    const { clearErrors } = useFormErrors();

    const { handleForm, errorMsg } = useSneakerForm({
        errorSetters: {
            sneakerCondition: (isError: boolean) => setIsSneakerConditionError(isError),
        },
        focusSetters: {
            sneakerCondition: (isFocused: boolean) => setIsSneakerConditionFocused(isFocused),
        },
        scrollViewRef
    });

    useEffect(() => {
        onErrorChange(errorMsg);
    }, [errorMsg]);

    useEffect(() => {
        onValueChange(sneakerConditionValue);
    }, [sneakerConditionValue]);

    useEffect(() => {
        setSneakerConditionValue(initialValue);
    }, [initialValue]);

    const handleChange = (text: string) => {
        const formattedText = text.replace(',', '.');
        if (formattedText === '' || !isNaN(Number(formattedText))) {
            setSneakerConditionValue(formattedText);
            handleForm.inputChange(formattedText, setSneakerConditionValue);
        }
    };

    return (
        <View className='flex-col items-center p-2 gap-1 w-1/3'>
            <Text className='font-spacemono text-center'>*Condition</Text>
            <View className="w-4/5">
                <TextInput
                    placeholder="0 - 10"
                    inputMode="decimal"
                    keyboardType="decimal-pad"
                    maxLength={3}
                    autoComplete="off"
                    value={sneakerConditionValue}
                    placeholderTextColor="gray"
                    returnKeyType="done"
                    enablesReturnKeyAutomatically={true}
                    onFocus={() => {
                        handleForm.inputFocus('sneakerCondition');
                        clearErrors();
                    }}
                    onBlur={() => handleForm.inputBlur('sneakerCondition', sneakerConditionValue)}
                    onChangeText={handleChange}
                    className={`bg-white rounded-md p-2 w-full font-spacemono-bold ${
                        (isSneakerConditionError || isError) ? 'border-2 border-red-500' : ''
                    } ${isSneakerConditionFocused ? 'border-2 border-primary' : ''}`}
                />
            </View>
        </View>
    );
} 